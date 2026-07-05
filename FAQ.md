# FAQ

**Is my data uploaded anywhere?** No. Everything runs in your browser. There is no server. See [PRIVACY.md](./PRIVACY.md).

**How do I get my export?** iPhone → Health app → tap your profile photo → Export All Health Data → `Export.zip`.

**My export is huge (200 MB+). Will it work?** Yes. Parsing is streamed in a Web Worker at ~3 s for a 238 MB file with flat memory use.

**Why does it ask for age and sex?** Only to select the correct reference ranges for VO₂ max, resting HR and HRV. It is never stored or sent.

**Some numbers look off / a metric is missing.** NerveDrive only shows what your devices recorded. Missing sensors (blood pressure, glucose, nutrition) simply won't appear. Estimates like VO₂ max are device-derived.

**Why are there menstrual / other records that aren't mine?** Shared devices and manual entries can commingle. NerveDrive flags and excludes likely contamination from health interpretation.

**Is this medical advice?** No. NerveDrive is not a medical device and does not diagnose. For symptoms, see a clinician.

**Can I use it offline?** Yes, with a one-step change to self-host fonts (see PRIVACY.md).
