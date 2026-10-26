"use client";

import styles from "./DitherCursorTrail.module.css";

import { useEffect, useRef } from "react";

type DitherCursorTrailProps = {

  pixelSize?: number;

  color?: string | [number, number, number];

  strength?: number;

  radius?: number;

  decayRate?: number;

  decayDuration?: number;
};

const DEFAULT_PIXEL_SIZE = 8;
const DEFAULT_COLOR: [number, number, number] = [23, 87, 232];

function resolveColor(
  color: string | [number, number, number],
): [number, number, number] {
  if (Array.isArray(color)) return color;

  let hex = color.trim().replace(/^#/, "");
  if (hex.length === 3) {

    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (hex.length !== 6 || /[^0-9a-fA-F]/.test(hex)) {
    return DEFAULT_COLOR;
  }
  const value = parseInt(hex, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}
const DEFAULT_STRENGTH = 0.04;
const DEFAULT_RADIUS = 0.04;
const DEFAULT_DECAY_RATE = 0.5;
const DEFAULT_DECAY_DURATION = 250;

function getSize(): [number, number] {
  return [window.innerWidth, window.innerHeight];
}

const VERTEX_SHADER =  `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
    v_uv = 0.5 * (a_position + 1.0);
    gl_Position = vec4(a_position.xy, 0.0, 1.0);
}`;

const SPLAT_FRAGMENT =  `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_velocity;
uniform vec2 u_vector;
uniform vec2 u_cursor;
uniform vec2 u_resolution;
uniform float u_strength;
uniform float u_radius;
out vec2 FragColor;
void main() {
    float strength = u_strength;
    float radius = u_radius;
    vec2 uv = v_uv;
    vec2 velocity = texture(u_velocity, uv).rg;
    vec2 pq = uv.xy;
    vec2 cursor = u_cursor / u_resolution;
    vec2 correction = cursor - pq.xy;
    correction.x *= u_resolution.x / u_resolution.y;
    float mouse_pct = length(correction);
    float influence = exp(-mouse_pct * mouse_pct / (radius * radius));
    velocity += influence * u_vector * strength;
    FragColor = velocity;
}`;

const DECAY_FRAGMENT =  `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_previous;
uniform float u_delta;
uniform float u_decay_rate;
uniform float u_decay_duration;
out vec2 FragColor;
void main() {
    FragColor = texture(u_previous, v_uv).rg * (1.0 - min(u_decay_rate, u_delta / u_decay_duration));
}`;

const COMPOSITE_FRAGMENT =  `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_cursor;
uniform vec2 u_resolution;
uniform float u_pixel_size;
uniform vec3 u_cursor_theme;
out vec4 FragColor;

float checkEqual(float first, float second) {
    float difference = abs(first - second);
    float inverted_number = ceil(1.0 * difference / 20.0);
    return (1.0 - inverted_number);
}

float drawLLLogo(vec2 rect, float opacity, float full) {
    float x = mod(round(mod(rect.x, 1.0) * 4.0 + 0.5 + 1.0), 4.0);
    float y = mod(round(mod(rect.y, 1.0) * 4.0 + 0.5), 4.0);
    float divider = (7.0 + 9.0 * full);
    float progress = 1.0 / divider;
    float offset = 0.0;
    float output_opacity = 0.0;
    float block_1 = step(1.0 - opacity, progress * (0.0 + offset));
    float block_2 = step(1.0 - opacity, progress * (1.0 + offset));
    float block_3 = step(1.0 - opacity, progress * (2.0 + offset));
    float block_4 = step(1.0 - opacity, progress * (3.0 + offset));
    float block_5 = step(1.0 - opacity, progress * (4.0 + offset));
    float block_6 = step(1.0 - opacity, progress * (5.0 + offset));
    float block_7 = step(1.0 - opacity, progress * (6.0 + offset));
    float block_8 = full * step(1.0 - opacity, progress * (7.0 + offset));
    float block_9 = full * step(1.0 - opacity, progress * (8.0 + offset));
    float block_10 = full * step(1.0 - opacity, progress * (9.0 + offset));
    float block_11 = full * step(1.0 - opacity, progress * (10.0 + offset));
    float block_12 = full * step(1.0 - opacity, progress * (11.0 + offset));
    float block_13 = full * step(1.0 - opacity, progress * (12.0 + offset));
    float block_14 = full * step(1.0 - opacity, progress * (13.0 + offset));
    float block_15 = full * step(1.0 - opacity, progress * (14.0 + offset));
    float block_16 = full * step(1.0 - opacity, progress * (15.0 + offset));
    output_opacity += block_1 * checkEqual(0.0, x) * checkEqual(0.0, y);
    output_opacity += block_2 * checkEqual(0.0, x) * checkEqual(2.0, y);
    output_opacity += block_3 * checkEqual(2.0, x) * checkEqual(1.0, y);
    output_opacity += block_4 * checkEqual(3.0, x) * checkEqual(3.0, y);
    output_opacity += block_5 * checkEqual(1.0, x) * checkEqual(3.0, y);
    output_opacity += block_6 * checkEqual(0.0, x) * checkEqual(1.0, y);
    output_opacity += block_7 * checkEqual(2.0, x) * checkEqual(0.0, y);
    output_opacity += block_8 * checkEqual(0.0, x) * checkEqual(3.0, y);
    output_opacity += block_9 * checkEqual(1.0, x) * checkEqual(2.0, y);
    output_opacity += block_10 * checkEqual(3.0, x) * checkEqual(2.0, y);
    output_opacity += block_11 * checkEqual(3.0, x) * checkEqual(0.0, y);
    output_opacity += block_12 * checkEqual(2.0, x) * checkEqual(3.0, y);
    output_opacity += block_13 * checkEqual(2.0, x) * checkEqual(2.0, y);
    output_opacity += block_14 * checkEqual(1.0, x) * checkEqual(0.0, y);
    output_opacity += block_15 * checkEqual(1.0, x) * checkEqual(1.0, y);
    output_opacity += block_16 * checkEqual(3.0, x) * checkEqual(1.0, y);
    return min(1.0, output_opacity);
}

void main() {
    vec2 screenUV = v_uv;
    float fullColumns = u_resolution.x / u_pixel_size;
    float fullRows = u_resolution.y / u_pixel_size;
    vec2 roundedScreenUV = vec2(
        round(screenUV.x * fullColumns) / fullColumns,
        round(screenUV.y * fullRows) / fullRows
    );
    vec2 vectorField = texture(u_cursor, roundedScreenUV).rg;
    vec2 uv_resolution = vec2(screenUV.x * fullColumns, screenUV.y * fullRows);
    float cursor_f = drawLLLogo(uv_resolution, length(vectorField), 0.0);
    float a = min(1.0, max(0.0, cursor_f));
    FragColor = vec4((u_cursor_theme / 255.0) * a, a);
}`;

const isDev = process.env.NODE_ENV !== "production";

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (isDev) {
      const kind = type === gl.VERTEX_SHADER ? "vertex" : "fragment";
      console.error(
        `[DitherCursorTrail] ${kind} shader compile error:\n`,
        gl.getShaderInfoLog(shader),
      );
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram | null {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader);
    if (fragmentShader) gl.deleteShader(fragmentShader);
    return null;
  }
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.bindAttribLocation(program, 0, "a_position");
  gl.linkProgram(program);

  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (isDev) {
      console.error(
        "[DitherCursorTrail] program link error:\n",
        gl.getProgramInfoLog(program),
      );
    }
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

type Field = {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
};

export default function DitherCursorTrail({
  pixelSize = DEFAULT_PIXEL_SIZE,
  color = DEFAULT_COLOR,
  strength = DEFAULT_STRENGTH,
  radius = DEFAULT_RADIUS,
  decayRate = DEFAULT_DECAY_RATE,
  decayDuration = DEFAULT_DECAY_DURATION,
}: DitherCursorTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pixelSizeRef = useRef(pixelSize);
  const colorRef = useRef<[number, number, number]>(resolveColor(color));
  const strengthRef = useRef(strength);
  const radiusRef = useRef(radius);
  const decayRateRef = useRef(decayRate);
  const decayDurationRef = useRef(decayDuration);
  pixelSizeRef.current = pixelSize;
  colorRef.current = resolveColor(color);
  strengthRef.current = strength;
  radiusRef.current = radius;
  decayRateRef.current = decayRate;
  decayDurationRef.current = decayDuration;

  useEffect(() => {

    const isTouch =
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(hover: none)").matches) ||
      "ontouchstart" in window;
    if (isTouch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    });
    if (!gl) return;

    if (!gl.getExtension("EXT_color_buffer_float")) return;

    const splatProgram = createProgram(gl, VERTEX_SHADER, SPLAT_FRAGMENT);
    const decayProgram = createProgram(gl, VERTEX_SHADER, DECAY_FRAGMENT);
    const compositeProgram = createProgram(
      gl,
      VERTEX_SHADER,
      COMPOSITE_FRAGMENT,
    );
    if (!splatProgram || !decayProgram || !compositeProgram) {
      if (splatProgram) gl.deleteProgram(splatProgram);
      if (decayProgram) gl.deleteProgram(decayProgram);
      if (compositeProgram) gl.deleteProgram(compositeProgram);
      return;
    }

    const splatUniforms = {
      u_velocity: gl.getUniformLocation(splatProgram, "u_velocity"),
      u_vector: gl.getUniformLocation(splatProgram, "u_vector"),
      u_cursor: gl.getUniformLocation(splatProgram, "u_cursor"),
      u_resolution: gl.getUniformLocation(splatProgram, "u_resolution"),
      u_strength: gl.getUniformLocation(splatProgram, "u_strength"),
      u_radius: gl.getUniformLocation(splatProgram, "u_radius"),
    };
    const decayUniforms = {
      u_previous: gl.getUniformLocation(decayProgram, "u_previous"),
      u_delta: gl.getUniformLocation(decayProgram, "u_delta"),
      u_decay_rate: gl.getUniformLocation(decayProgram, "u_decay_rate"),
      u_decay_duration: gl.getUniformLocation(decayProgram, "u_decay_duration"),
    };
    const compositeUniforms = {
      u_cursor: gl.getUniformLocation(compositeProgram, "u_cursor"),
      u_resolution: gl.getUniformLocation(compositeProgram, "u_resolution"),
      u_pixel_size: gl.getUniformLocation(compositeProgram, "u_pixel_size"),
      u_cursor_theme: gl.getUniformLocation(compositeProgram, "u_cursor_theme"),
    };

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,

      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    let fieldWidth = 0;
    let fieldHeight = 0;
    let fields: [Field, Field] | null = null;
    let read = 0;

    function createField(width: number, height: number): Field | null {
      const context = gl as WebGL2RenderingContext;
      const texture = context.createTexture();
      if (!texture) return null;
      context.bindTexture(context.TEXTURE_2D, texture);
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RG16F,
        width,
        height,
        0,
        context.RG,
        context.HALF_FLOAT,
        null,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MIN_FILTER,
        context.LINEAR,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_MAG_FILTER,
        context.LINEAR,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_WRAP_S,
        context.CLAMP_TO_EDGE,
      );
      context.texParameteri(
        context.TEXTURE_2D,
        context.TEXTURE_WRAP_T,
        context.CLAMP_TO_EDGE,
      );
      const framebuffer = context.createFramebuffer();
      if (!framebuffer) {
        context.deleteTexture(texture);
        return null;
      }
      context.bindFramebuffer(context.FRAMEBUFFER, framebuffer);
      context.framebufferTexture2D(
        context.FRAMEBUFFER,
        context.COLOR_ATTACHMENT0,
        context.TEXTURE_2D,
        texture,
        0,
      );

      context.viewport(0, 0, width, height);
      context.clearColor(0, 0, 0, 0);
      context.clear(context.COLOR_BUFFER_BIT);
      return { texture, framebuffer };
    }

    function destroyFields() {
      if (!fields) return;
      for (const field of fields) {
        gl!.deleteTexture(field.texture);
        gl!.deleteFramebuffer(field.framebuffer);
      }
      fields = null;
    }

    function allocateFields() {
      destroyFields();
      const [w, h] = getSize();
      fieldWidth = Math.max(1, Math.floor(w));
      fieldHeight = Math.max(1, Math.floor(h));
      const a = createField(fieldWidth, fieldHeight);
      const b = createField(fieldWidth, fieldHeight);
      if (!a || !b) {
        if (a) {
          gl!.deleteTexture(a.texture);
          gl!.deleteFramebuffer(a.framebuffer);
        }
        if (b) {
          gl!.deleteTexture(b.texture);
          gl!.deleteFramebuffer(b.framebuffer);
        }
        fields = null;
        return;
      }
      fields = [a, b];
      read = 0;
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;
      const backingWidth = Math.max(1, Math.floor(cssWidth * dpr));
      const backingHeight = Math.max(1, Math.floor(cssHeight * dpr));
      if (canvas!.width !== backingWidth) canvas!.width = backingWidth;
      if (canvas!.height !== backingHeight) canvas!.height = backingHeight;
      allocateFields();
    }

    resize();

    let current: [number, number] | null = null;
    let last: [number, number] | null = null;

    function splat(vector: [number, number], cursor: [number, number]) {
      if (!fields) return;
      const context = gl as WebGL2RenderingContext;
      const source = fields[read];
      const target = fields[1 - read];

      context.disable(context.BLEND);
      context.useProgram(splatProgram);
      context.bindVertexArray(vao);
      context.bindFramebuffer(context.FRAMEBUFFER, target.framebuffer);
      context.viewport(0, 0, fieldWidth, fieldHeight);

      context.activeTexture(context.TEXTURE0);
      context.bindTexture(context.TEXTURE_2D, source.texture);
      context.uniform1i(splatUniforms.u_velocity, 0);
      context.uniform2f(splatUniforms.u_vector, vector[0], vector[1]);
      context.uniform2f(splatUniforms.u_cursor, cursor[0], cursor[1]);
      context.uniform2f(
        splatUniforms.u_resolution,
        window.innerWidth,
        window.innerHeight,
      );
      context.uniform1f(splatUniforms.u_strength, strengthRef.current);
      context.uniform1f(splatUniforms.u_radius, radiusRef.current);

      context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
      read = 1 - read;
    }

    function handleMouseMove(event: MouseEvent) {
      last = current;
      current = [event.clientX, window.innerHeight - event.clientY];
      if (!last) return;
      const vector: [number, number] = [
        current[0] - last[0],
        current[1] - last[1],
      ];
      splat(vector, current);
    }

    function decay(delta: number) {
      if (!fields) return;
      const context = gl as WebGL2RenderingContext;
      const source = fields[read];
      const target = fields[1 - read];

      context.disable(context.BLEND);
      context.useProgram(decayProgram);
      context.bindVertexArray(vao);
      context.bindFramebuffer(context.FRAMEBUFFER, target.framebuffer);
      context.viewport(0, 0, fieldWidth, fieldHeight);

      context.activeTexture(context.TEXTURE0);
      context.bindTexture(context.TEXTURE_2D, source.texture);
      context.uniform1i(decayUniforms.u_previous, 0);
      context.uniform1f(decayUniforms.u_delta, delta);
      context.uniform1f(decayUniforms.u_decay_rate, decayRateRef.current);
      context.uniform1f(
        decayUniforms.u_decay_duration,
        decayDurationRef.current,
      );

      context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
      read = 1 - read;
    }

    function composite() {
      if (!fields) return;
      const context = gl as WebGL2RenderingContext;
      const dpr = window.devicePixelRatio || 1;
      const source = fields[read];

      context.bindFramebuffer(context.FRAMEBUFFER, null);
      context.viewport(0, 0, canvas!.width, canvas!.height);
      context.clearColor(0, 0, 0, 0);
      context.clear(context.COLOR_BUFFER_BIT);

      context.enable(context.BLEND);
      context.blendFunc(context.ONE, context.ONE_MINUS_SRC_ALPHA);

      context.useProgram(compositeProgram);
      context.bindVertexArray(vao);

      context.activeTexture(context.TEXTURE0);
      context.bindTexture(context.TEXTURE_2D, source.texture);
      context.uniform1i(compositeUniforms.u_cursor, 0);
      context.uniform2f(
        compositeUniforms.u_resolution,
        canvas!.width,
        canvas!.height,
      );

      context.uniform1f(
        compositeUniforms.u_pixel_size,
        pixelSizeRef.current * dpr,
      );
      const themeColor = colorRef.current;
      context.uniform3f(
        compositeUniforms.u_cursor_theme,
        themeColor[0],
        themeColor[1],
        themeColor[2],
      );

      context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
    }

    let rafId = 0;
    let previousTime = performance.now();

    function frame(now: number) {
      const delta = now - previousTime;
      previousTime = now;
      decay(delta);
      composite();
      rafId = window.requestAnimationFrame(frame);
    }
    rafId = window.requestAnimationFrame(frame);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);

      destroyFields();
      gl.deleteBuffer(quadBuffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(splatProgram);
      gl.deleteProgram(decayProgram);
      gl.deleteProgram(compositeProgram);
    };
  }, []);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
  );
}
