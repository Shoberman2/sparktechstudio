import { useRef } from 'react'
import { useLoop } from './useLoop'
import { built, systems, EMAIL, year } from './content.jsx'
import './Liquid.css'

// Liquid metal: a domain-warped height field lit like polished chrome, with gold catching the highlights. One full-screen quad, one shader.
const FRAG = `
precision highp float;
uniform vec2 r; uniform float t; uniform vec2 m;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; mat2 R = mat2(.8,.6,-.6,.8); for (int i = 0; i < 5; i++){ v += a*n(p); p = R*p*2.02; a *= .5; } return v; }
float field(vec2 p){
  vec2 q = vec2(fbm(p + .07*t), fbm(p + vec2(5.2,1.3) - .05*t));
  vec2 s = vec2(fbm(p + 3.*q + vec2(1.7,9.2) + .11*t), fbm(p + 3.*q + vec2(8.3,2.8) - .09*t));
  return fbm(p + 2.6*s);
}
void main(){
  vec2 uv = gl_FragCoord.xy / r; vec2 p = (gl_FragCoord.xy - .5*r) / r.y;
  p += (m - .5) * vec2(.12, -.12);
  vec2 P = p * 1.6; float e = 1.5 / r.y;
  float c = field(P), cx = field(P + vec2(e,0.)), cy = field(P + vec2(0.,e));
  vec3 N = normalize(vec3((c-cx)/e*.018, (c-cy)/e*.018, 1.));
  vec3 L = normalize(vec3(-.4, .6, .7)); vec3 V = vec3(0,0,1);
  float diff = max(dot(N, L), 0.);
  float spec = pow(max(dot(reflect(-L, N), V), 0.), 48.);
  float band = .5 + .5*sin(N.x*9. + N.y*6. + c*8.);
  vec3 ink = vec3(.043,.043,.05);
  vec3 steel = mix(vec3(.13,.13,.15), vec3(.86,.87,.9), pow(band, 1.6)*diff);
  vec3 gold = vec3(.83,.66,.29);
  vec3 col = mix(ink, steel, smoothstep(.3, .8, c));
  col += gold * spec * 1.4 + gold * pow(band, 6.) * .3 * smoothstep(.25, .6, c);
  col *= smoothstep(1.3, .2, length(uv - vec2(.68,.55)));
  col += (h(gl_FragCoord.xy + t) - .5) * .018;
  gl_FragColor = vec4(col, 1.);
}`

function setupGL(gl, canvas) {
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s }
  const prog = gl.createProgram()
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'))
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog); gl.useProgram(prog)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  const u = { r: gl.getUniformLocation(prog, 'r'), t: gl.getUniformLocation(prog, 't'), m: gl.getUniformLocation(prog, 'm') }
  return (w, h, time, ptr) => {
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(u.r, canvas.width, canvas.height); gl.uniform1f(u.t, time); gl.uniform2f(u.m, ptr.x, ptr.y)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}

export default function Liquid() {
  const ref = useRef(null)
  const setup = setupGL
  useLoop(ref, setup, { gl: true })
  return <div className="lq">
    <header className="lq-nav">
      <a href="/designs/1" className="lq-mark"><img src="/logo.svg" width="18" height="18" alt="" />SparkTech Studio</a>
      <nav><a href="#built">Built</a><a href="#systems">Systems</a><a href="#contact">Contact</a></nav>
    </header>
    <section className="lq-hero">
      <canvas ref={ref} className="lq-canvas" aria-hidden="true" />
      <div className="lq-hero-copy">
        <p className="lq-kicker">Independent studio · New York</p>
        <h1><span>We create</span><span>the <em>future.</em></span></h1>
      </div>
      <p className="lq-scroll">Scroll</p>
    </section>
    <section className="lq-sys" id="systems">
      <p className="lq-label">The systems</p>
      <h2>{systems.title}</h2>
      <p className="lq-sys-lead">{systems.lead}</p>
      <ol>{systems.steps.map(k => <li key={k}>{k}</li>)}</ol>
      <p className="lq-sys-proof"><i aria-hidden="true" />{systems.status}</p>
    </section>
    <section className="lq-built" id="built">
      <p className="lq-label">What we’ve built · Each one runs as its own company</p>
      <ol>
        {built.map((b, i) => <li key={b.name} style={{ '--i': i }}>
          <a href={b.url}>
            <strong>{b.name}</strong>
            <span className="lq-line">{b.line}</span>
            <span className="lq-host">{b.host}</span>
          </a>
        </li>)}
      </ol>
    </section>
    <section className="lq-contact" id="contact">
      <p className="lq-label">Next</p>
      <a className="lq-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
    </section>
    <footer className="lq-foot"><span>© {year} SparkTech Studios, LLC</span><span>We create the future.</span></footer>
  </div>
}
