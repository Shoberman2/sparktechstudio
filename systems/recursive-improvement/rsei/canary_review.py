"""Safe exact-envelope presentation helpers for a small local approval view.

The Tk view can be layered on these pure helpers. It is intentionally not wired
to Graph send; approval never dispatches a message.
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class ReviewCard:
    sender: str
    recipient: str
    category: str
    subject: str
    text_body: str
    content_hash: str
    expires_at: str
    max_messages: int = 1

    @classmethod
    def from_request(cls, request):
        required = ("sender", "recipient", "category", "subject", "text_body", "message_hash", "approval_expires_at")
        if any(not isinstance(request.get(key), str) or not request[key] for key in required):
            raise ValueError("incomplete exact-message review request")
        if request.get("max_messages") != 1 or request.get("html_body") is not None:
            raise ValueError("review view only permits one plain-text message")
        return cls(request["sender"], request["recipient"], request["category"],
                   request["subject"], request["text_body"], request["message_hash"],
                   request["approval_expires_at"])


@dataclass
class ReviewControls:
    acknowledged_exact_message: bool = False
    authenticated: bool = False

    @property
    def can_decide(self):
        return self.acknowledged_exact_message and self.authenticated

    @property
    def can_send(self):
        return False


def open_review_window(request, reviewer, controller):
    """Open a local Tk review window. Approve/deny authenticates afresh; no send button."""
    import tkinter as tk
    from tkinter import messagebox
    card = ReviewCard.from_request(request)
    root = tk.Tk()
    root.title("SparkTech one-message review")
    root.geometry("680x560")
    root.resizable(False, False)
    tk.Label(root, text="Review exact message", font=("TkDefaultFont", 16, "bold")).pack(anchor="w", padx=20, pady=(18, 10))
    for label, value in (("Sender",card.sender),("Recipient",card.recipient),("Category",card.category),
                         ("Subject",card.subject),("Expires",card.expires_at),
                         ("Messages allowed",str(card.max_messages)),("Content SHA-256",card.content_hash)):
        tk.Label(root, text=f"{label}: {value}", anchor="w", justify="left", wraplength=630).pack(fill="x", padx=20, pady=2)
    body = tk.Text(root, height=12, wrap="word", state="normal")
    body.insert("1.0", card.text_body)
    body.configure(state="disabled")
    body.pack(fill="both", expand=True, padx=20, pady=12)
    acknowledged = tk.BooleanVar(value=False)
    checkbox = tk.Checkbutton(root, text="I reviewed this exact message and its recipient", variable=acknowledged)
    checkbox.pack(anchor="w", padx=20)
    status = tk.StringVar(value="A decision does not send the message. Sending remains disabled.")
    tk.Label(root, textvariable=status, wraplength=630, justify="left").pack(anchor="w", padx=20, pady=8)
    def decide(approved):
        if not acknowledged.get():
            messagebox.showerror("Review required", "Review and acknowledge the exact message first.", parent=root)
            return
        try:
            decision = reviewer.authenticate_decision(controller._challenge, approved)
            result = controller.accept_authenticated_decision(decision)
            status.set(f"Decision recorded: {result['status']}. Sending remains disabled.")
            approve_button.configure(state="disabled")
            deny_button.configure(state="disabled")
        except Exception as exc:
            messagebox.showerror("Decision not recorded", str(exc), parent=root)
    buttons = tk.Frame(root)
    buttons.pack(pady=(4,18))
    available = controller.state == "awaiting_human_approval"
    if not available:
        status.set(f"This challenge is {controller.state}; no further decision is available. Sending remains disabled.")
    initial_state = "normal" if available else "disabled"
    approve_button = tk.Button(buttons, text="Approve exact message", command=lambda: decide(True), state=initial_state)
    deny_button = tk.Button(buttons, text="Deny", command=lambda: decide(False), state=initial_state)
    approve_button.pack(side="left", padx=6)
    deny_button.pack(side="left", padx=6)
    cancel_button = tk.Button(buttons, text="Cancel", command=root.destroy)
    cancel_button.pack(side="left", padx=6)
    root.mainloop()
