uniform sampler2D tDiffuse;
uniform float uScrollSpeed;
varying vec2 vUv;

float noise(vec3 uv, float res) {
    const vec3 s = vec3(1e0, 1e2, 1e3);

    uv *= res;

    vec3 uv0 = floor(mod(uv, res)) * s;
    vec3 uv1 = floor(mod(uv + vec3(1.), res)) * s;

    vec3 f = fract(uv);
    f = f * f * (3.0 - 2.0 * f);

    vec4 v = vec4(uv0.x + uv0.y + uv0.z, uv1.x + uv0.y + uv0.z, uv0.x + uv1.y + uv0.z, uv1.x + uv1.y + uv0.z);

    vec4 r = fract(sin(v * 1e-1) * 1e3);
    float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);

    r = fract(sin((v + uv1.z - uv0.z) * 1e-1) * 1e3);
    float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);

    return mix(r0, r1, f.z) * 2.1 - 1.;
}

float noiseMultiplier(vec3 coord) {
    float n = 0.;

    n += 0.2 * noise(coord, 10.);
    n += 0.2 * noise(coord, 10.);

    return n;
}

void main() {
    vec2 newUV = vUv;

    float gooeyNoise = noiseMultiplier(vec3(newUV * 4.9, 0.1)) * uScrollSpeed;
    newUV.x += gooeyNoise * -0.60;
    newUV.y += gooeyNoise * 1.35;

    vec4 color = texture2D(tDiffuse, newUV);

    float luminance = dot(color.rgb, vec3(0.75, 0.05, 1.));
    vec4 desaturatedColor = mix(color, vec4(vec3(luminance), color.a), 0.48);

    gl_FragColor = desaturatedColor;

}
