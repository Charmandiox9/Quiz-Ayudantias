# Reference analysis: quiz explainer mascot

## Identification

- Stylized bipedal reptile/dragon mascot, character domain, confidence 0.98.
- One full-body near-frontal illustration with a photographic peaked cap composited on the head.
- Intended runtime is a real-time browser explainer with articulated gesture animation.

## Overall form and silhouette

- Organic, bilaterally arranged body with an asymmetric swept tail and flame.
- Approximately 3.3 stylized head units tall: oversized rounded head, narrow neck, pear-shaped torso, short arms, straight legs and broad flat feet.
- The head projects forward into a blunt rounded snout. The tail exits the posterior pelvis and sweeps laterally before curving upward at the tip.

## Component hierarchy

- Root character group
  - pelvis/torso mass
    - pale yellow ventral patch
    - left/right legs and feet
    - left/right shoulders, upper arms, forearms and three-claw hands
    - neck and head
      - snout volume
      - paired dark eyes, paired nostrils and curved smile
      - peaked cap: red band, black crown, black visor, gold braid and emblem
    - tail chain
      - orange curved tail segments
      - outer red/orange flame and inner yellow flame

## Spatial relationships

- Head overlaps the neck and sits above the torso; snout projects toward the reference camera.
- Arms socket into the upper lateral torso and hang forward with elbows bent.
- Legs socket below the pelvis and contact the ground through flattened feet.
- Ventral patch lies slightly proud of the anterior torso surface.
- Cap crown rests on the superior head; visor projects over the face.
- Tail sockets into the posterior pelvis, curves outward, then returns toward an elevated tip; flame is attached at that terminal socket.

## Materials and color

- Body: saturated orange dielectric, matte-to-satin, approximately `#F48732`.
- Belly: warm pale yellow dielectric, matte, approximately `#F1DD72`.
- Facial linework/features: near-black, matte.
- Cap crown/visor: near-black fabric/leather-like surface, medium roughness.
- Cap band: saturated dark red satin; trim/emblem: warm gold metallic.
- Flame: opaque emissive-style red/orange outer shape with a yellow inner core.

## Identity-defining features

1. Oversized rounded snout and small vertical dark eyes.
2. Curved friendly mouth with a slightly raised corner.
3. Pale yellow neck-to-belly patch.
4. Short forearms held forward with three dark claw marks.
5. Long swept tail ending in a two-tone flame.
6. Oversized black peaked cap with red band, gold braid and centered gold emblem.
7. Thick black outline in the source, approximated in 3D through dark feature geometry rather than a full toon-outline pass.

## Uncertainty and limits

- Only one near-frontal view is available; rear anatomy, cap rear profile, tail cross-section and exact limb depth are hidden.
- The photographic cap has finer ornament than the illustrated body; small insignia details will be simplified procedurally.
- The reference has no neutral T-pose. Joint placements and hidden limb volume are inferred for explanatory gestures.
- Target is explicitly a stylized procedural approximation suitable for a small in-app viewport, not an exact character mesh or photogrammetric reconstruction.

## Quality contract summary

- Preserve the head/snout, belly, cap and flame-tail silhouette at the hero camera.
- Every limb, head, jaw/face group, tail chain and flame must have a stable pivot suitable for animation.
- Required views: reference-match, ±35 degrees, 90-degree profile and rear.
- Blocking defects: missing cap or flame, straight/non-swept tail, generic spherical face with no projecting snout, detached accessories, inverted left/right limbs, or gestures that separate joints.

## Suitability verdict

`character-conditional -> stylized`. The target, pose and silhouette are readable and can be approximated with procedural continuous volumes. The 505×556 single view does not support exact hidden-side geometry or exact cap ornament, but it is sufficient for the requested small real-time explainer if those regions are treated as explicitly inferred.
