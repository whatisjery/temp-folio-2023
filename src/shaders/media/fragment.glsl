uniform sampler2D uTexture;
uniform float uMsize;
uniform float uIsHover;
uniform vec2 uMouse;

varying vec2 vUv;
varying float vIsResume;
varying float vOpacity;

vec2 gooeySpiralEffect(vec2 uv) {
    float distance = length(uv - vec2(uMouse.x, 1.0 - uMouse.y));

    float spread = sin(distance * 8.) * 0.008;

    float multiplier = (0.01 + spread) * uIsHover;

    vec2 pos = vec2(uMouse.x, 1.0 - uMouse.y);
    vec2 vec = pos - uv;
    float angle = atan(vec.y, vec.x) + multiplier;

    return uv + multiplier * vec2(cos(angle), sin(angle)) / length(vec);
}

void main() {
    vec2 uv = vUv;

    if(uMsize == 0. && vIsResume != 1.) {
        uv = gooeySpiralEffect(uv);
    }

    vec4 color = texture2D(uTexture, uv);

    if(vIsResume == 1.) {
        color.a = vOpacity;
    }

    gl_FragColor = color;
}
