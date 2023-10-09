varying vec2 vUv;
varying float vIsResume;
varying float vOpacity;

uniform float uResumeTransition;
uniform float uScrollSpeed;
uniform float uOpacity;
uniform float uIsResume;
uniform float uTime;
uniform float uIsHover;

float PI = 3.14;

vec3 wavyEffect(vec3 pos, float ease, float transition) {

    float dist = distance(pos.xy, vec2(0.5));
    float strength = dist * 11.0 - uTime * 1.;

    return pos + (0.02 + transition) * vec3(cos(strength), sin(strength), 0.) * ease;
}

float scrollSinEffect(float y, float x, float speed) {
    return y + -((sin(x * PI) * speed * 0.1));
}

void main() {
    vec3 pos = position;
    pos.y = scrollSinEffect(pos.y, uv.x, uScrollSpeed * 2.);

    float transition = uResumeTransition * 1.7;

    if(uIsResume == 1.) {
        pos = wavyEffect(pos, ((uIsHover + .2) * 0.2), transition);
    } else {
        pos = wavyEffect(pos, ((uIsHover) * 0.1), 0.);
    }

    vUv = uv;
    vIsResume = uIsResume;
    vOpacity = uOpacity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
}
