\#\#\# File 4: \`03\_FUNCTIONAL\_SPECS.md\`

This is the step-by-step blueprint. When asking Claude to build a view, reference the specific section number here.

\`\`\`markdown  
\# FUNCTIONAL SPECIFICATIONS (The Blueprint)

Reference the specific view section below when building components. Ensure all components adhere to the constraints in \`00\_MASTER\_INSTRUCTIONS.md\` and \`01\_DESIGN\_SYSTEM.md\`.

\---

\#\# 5.1 View: Splash & Shift Initialization

\*\*Goal:\*\* Quick, accurate setup of the shift context (Rig & Driller).

\*\*UI Components:\*\*  
1\.  \*\*Header:\*\* Fixed banner, Safety Yellow background, bold black text: "RSK SITE DIARY \- START SHIFT".  
2\.  \*\*Date Display:\*\* Large read-only display of today's date.  
3\.  \*\*Selection Cards (Anti-Typing):\*\* Two large, full-width cards stacked vertically. Title "SELECT RIG" and "SELECT LEAD DRILLER". Tapping opens a modal with massive buttons populated from Supabase (\`rigs\`/\`crew\_members\`).  
4\.  \*\*Primary Action Button:\*\* A massive yellow button at the bottom: "BEGIN PRE-START CHECKS".

\*\*Logic & Behavior:\*\*  
\* The "BEGIN PRE-START CHECKS" button is disabled until \*both\* Rig and Driller have a valid selection.  
\* \*\*On Tap Action:\*\* Create new record in \`shifts\` table; Navigate to View 5.2.

\*\*Acceptance Criteria:\*\*  
\* \[ \] User cannot proceed without selecting both Rig and Driller.  
\* \[ \] All selection targets are at least 88px tall.  
\* \[ \] A new shift record is created in Supabase upon proceeding.

\---

\#\# 5.2 View: The Safety Gateway (Critical Feature)

\*\*Goal:\*\* Enforce mandatory safety compliance before work begins. A blocking gate.

\*\*UI Components:\*\*  
1\.  \*\*Header:\*\* "PRE-START SAFETY CHECKS".  
2\.  \*\*The Checklist:\*\* 5 mandatory checks (e.g., "Emergency Stops Tested", "Guards in Place").  
3\.  \*\*Toggle Interactions (Glove-First):\*\* Each check is a full-width container. Left side: Label. Right side: A massive toggle switch (min 80x80px touch area). Default state is Red ("NO"). Tap to turn Green ("YES").  
4\.  \*\*Primary Action Button:\*\* Massive button: "CONFIRM SAFETY & START WORK".

\*\*Logic & Behavior:\*\*  
\* \*\*The Gateway Rule:\*\* The action button MUST remain disabled until \*\*every single toggle\*\* is set to "YES" (Green).  
\* \*\*On Tap Action:\*\* Update \`shifts.safety\_check\_completed \= true\` in Supabase; Navigate to View 5.3.

\*\*Acceptance Criteria:\*\*  
\* \[ \] Toggles are large and easy to tap with imprecise inputs.  
\* \[ \] It is impossible to proceed if even one check is marked "NO".  
\* \[ \] Proceeding updates the database record correctly.

\---

\#\# 5.3 View: The Main Shift Hub (Dashboard)

\*\*Goal:\*\* High-level overview of shift progress and entry point for data.

\*\*UI Components:\*\*  
1\.  \*\*Header:\*\* Rig Name and Date.  
2\.  \*\*Progress Banner:\*\* High-contrast banner showing: "TOTAL METERS: \[X.X\]m" and "CURRENT DEPTH: \[Y.Y\]m".  
3\.  \*\*Activity Feed:\*\* Reverse-chronological list of \`activity\_logs\`.  
    \* \*Drilling Cards:\* Distinct Green left-border. Shows depths and Bit SN.  
    \* \*Standby Cards:\* Distinct Red left-border. Shows duration and Reason.  
4\.  \*\*Primary Action Button:\*\* Massive, screen-dominating Safety Yellow button fixed to bottom: "+ ADD ACTIVITY BLOCK".

\*\*Logic & Behavior:\*\*  
\* Feed refreshes automatically on new log.  
\* Tapping "+ ADD ACTIVITY BLOCK" navigates to View 5.4.

\*\*Acceptance Criteria:\*\*  
\* \[ \] Total meters calculated correctly from logs.  
\* \[ \] Drilling vs Standby logs are visually distinct.  
\* \[ \] The "+ Add" button is the most prominent element.

\---

\#\# 5.4 View: Add Activity Flow (The Core Workflow)

\*\*Goal:\*\* Capture time, depth, and asset data accurately without typing.

\*\*Step 1: Activity Type Selection\*\*  
Two massive, screen-height vertical cards side-by-side. Left: Green "DRILLING". Right: Red "STANDBY / DELAY".

\*\*Step 2a: If "DRILLING" is selected:\*\*  
\* \*\*Time:\*\* Large Steppers for Start/End Time (5 min increments).  
\* \*\*Depth (Giant Stepper Component):\*\*  
    \* \*Start Depth:\* Read-only massive display (populates from previous log end depth).  
    \* \*End Depth:\* Massive numerical display. Below it, a row of four giant buttons: \`\[-1.0\] \[-0.1\]  \[+0.1\] \[+1.0\]\`.  
\* \*\*Bit Selection:\*\* Horizontal scrolling list of large, selectable cards from Supabase \`drill\_bits\`. Selected card turns green.

\*\*Step 2b: If "STANDBY" is selected:\*\*  
\* \*\*Time:\*\* Large Steppers as above.  
\* \*\*Reason Selector:\*\* List of massive, full-width selectable cards for billing codes (e.g., "Weather Delay (Non-Billable)", "Client Instruction (Billable)").

\*\*Final Step: Submit\*\*  
Massive green button "SAVE BLOCK". Validate inputs. Insert into \`activity\_logs\`. Return to View 5.3.

\*\*Acceptance Criteria:\*\*  
\* \[ \] Zero use of native keyboard.  
\* \[ \] Depth Stepper buttons are large enough for gloved use.  
\* \[ \] A drill bit MUST be selected to save a Drilling block.  
\* \[ \] Start depth auto-populates correctly.

\---

\#\# 5.5 View: End Shift

\*\*Goal:\*\* Final verification and submission.

\*\*UI Components:\*\*  
1\.  \*\*Shift Summary:\*\* List showing Total Hours, Total Meters, Total Standby hours.  
2\.  \*\*Confirmation Toggle:\*\* Single, massive toggle switch: "I confirm this record is accurate ground truth."  
3\.  \*\*Submit Button:\*\* Massive yellow button: "SUBMIT FINAL REPORT".

\*\*Logic & Behavior:\*\*  
\* Submit button disabled until Confirmation Toggle is "YES".  
\* \*\*On Tap Action:\*\* Update \`shifts.status\` to "Submitted"; Return to Splash.

\*\*Acceptance Criteria:\*\*  
\* \[ \] User cannot submit without toggling confirmation.  
\* \[ \] Submission updates the database status correctly.  
