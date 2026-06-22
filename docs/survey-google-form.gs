/**
 * Auto-creates the market-research survey as a Google Form.
 *
 * HOW TO USE (5 minutes, free):
 *  1. Host your STATIC demo first (drag the `demo` folder to https://app.netlify.com/drop)
 *     and copy the public URL.
 *  2. Paste that URL into DEMO_LINK below.
 *  3. Go to https://script.google.com  ->  New project.
 *  4. Delete the sample code, paste THIS whole file, and click Save.
 *  5. Click Run (the ▶ button) on `createSurvey`. Approve the permission prompt
 *     (it only creates a Form in your own Drive).
 *  6. Open View -> Logs (or Execution log). It prints two links:
 *        EDIT link  -> tweak wording / see responses
 *        SHARE link -> this is what you send people in the bridge message
 */

var DEMO_LINK = 'PASTE_YOUR_NETLIFY_DEMO_URL_HERE';

function createSurvey() {
  var form = FormApp.create('Deepfake fraud in hiring — 3-minute research survey');
  form.setDescription(
    "I'm researching how hiring teams handle fake/deepfake candidates. " +
    "This is research, not a sales pitch — no one will contact you to sell anything. " +
    "It takes ~3 minutes and includes a 60-second demo to react to. " +
    "Thank you — this genuinely shapes whether I build it."
  );
  form.setProgressBar(true);
  form.setCollectEmail(false);

  // ---- Section 1: You ----
  form.addMultipleChoiceItem().setTitle('Your role').setRequired(true)
    .setChoiceValues(['Recruiter / Talent Acquisition','HR / People Ops','Security / IT','Founder / Exec','Other']);
  form.addMultipleChoiceItem().setTitle('Company size')
    .setChoiceValues(['1–50','51–200','201–1,000','1,000+']);
  form.addMultipleChoiceItem().setTitle('How much of your interviewing is remote / video?')
    .setChoiceValues(['Most','Some','Very little']);

  // ---- Section 2: The problem ----
  form.addMultipleChoiceItem().setTitle("Have you ever suspected or caught a candidate who wasn't who they claimed (deepfake, impersonation, AI-assisted)?")
    .setChoiceValues(['Yes, caught one','Yes, suspected','No','Not sure']);
  form.addParagraphTextItem().setTitle('If yes — what happened, and what did it cost you?');
  form.addScaleItem().setTitle('How serious is candidate identity fraud vs your other hiring problems today?')
    .setBounds(1,5).setLabels('Not on my radar','Keeps me up at night');
  form.addParagraphTextItem().setTitle('Do you currently pay for any identity or background verification? Which, and roughly how much?');

  // ---- Section 3: React to the demo (own page) ----
  form.addPageBreakItem().setTitle('React to the demo')
    .setHelpText('Please open this 60-second demo, click through the sample candidates, then answer the next questions:\n\n' + DEMO_LINK);
  form.addScaleItem().setTitle('First reaction to the demo?')
    .setBounds(1,5).setLabels('Not useful','I want this');
  form.addMultipleChoiceItem().setTitle('Would something like this fit into your hiring process?')
    .setChoiceValues(['Yes','Maybe','No']);
  form.addParagraphTextItem().setTitle("What's missing, or what would stop you trusting / using it?");

  // ---- Section 4: Willingness to pay ----
  form.addPageBreakItem().setTitle('If it worked well…');
  form.addMultipleChoiceItem().setTitle('If it reliably flagged fake candidates, would your team pay for it?')
    .setChoiceValues(['Yes','Maybe','No','Not my budget to decide']);
  form.addMultipleChoiceItem().setTitle('Whose budget would this come from?')
    .setChoiceValues(['Mine','HR / Talent','Security / IT',"Don't know"]);
  form.addMultipleChoiceItem().setTitle('What would you expect to pay per candidate check?')
    .setChoiceValues(["Wouldn't pay",'Under $2','$2–5','$5–15','$15–50','$50+']);
  form.addMultipleChoiceItem().setTitle('Or, as a monthly subscription per recruiter seat?')
    .setChoiceValues(["Wouldn't",'Under $25','$25–75','$75–200','$200+']);

  // ---- Section 5: Commitment ----
  form.addPageBreakItem().setTitle('One last thing');
  form.addMultipleChoiceItem().setTitle("We're opening a few paid pilots soon. Want in, or want early access?")
    .setChoiceValues(["Yes, I'd pilot it (I'll leave my email)",'Keep me posted','No']);
  form.addTextItem().setTitle('Email (only if you want updates / a pilot)');
  form.addParagraphTextItem().setTitle('Anyone else dealing with this we should talk to?');

  Logger.log('================  YOUR SURVEY IS READY  ================');
  Logger.log('EDIT  (tweak + view responses): ' + form.getEditUrl());
  Logger.log('SHARE (send this to people)   : ' + form.getPublishedUrl());
}
