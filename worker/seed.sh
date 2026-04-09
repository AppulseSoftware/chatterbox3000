#!/bin/bash
# Seed test emails into the local dev worker
# Usage: ./seed.sh [base_url] [auth_token]

BASE="${1:-http://localhost:8788}"
TOKEN="${2:-$(grep AUTH_TOKEN .dev.vars | cut -d= -f2)}"

post() {
  curl -s -X POST "$BASE/api/emails/test" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$1" | bun -e 'const d=await Bun.stdin.json();console.log(`  [${d.classification}] ${d.subject}`)'
}

echo "Seeding test emails..."
echo ""
echo "--- legitimate ---"

post '{"sender":"alice@example.com","from":"Alice Johnson <alice@example.com>","subject":"Invoice #1234","bodyPreview":"Hi, please find attached the invoice for March. Let me know if you have any questions."}'

post '{"sender":"noreply@github.com","from":"GitHub <noreply@github.com>","subject":"[chatterbox3000] New issue opened: Fix email parsing","bodyPreview":"eelco opened a new issue in your-org/chatterbox3000: The email parser fails on multipart MIME messages with nested boundaries."}'

post '{"sender":"support@cloudflare.com","from":"Cloudflare Support <support@cloudflare.com>","subject":"Your ticket #98765 has been updated","bodyPreview":"Hi, we have an update on your support ticket regarding Email Routing configuration."}'

post '{"sender":"cto@partnercompany.com","from":"Maria Chen <cto@partnercompany.com>","subject":"Re: API integration timeline","bodyPreview":"Thanks for the update. We are on track for the Q2 launch. I will send over the final spec by Friday."}'

echo ""
echo "--- cold_outreach (subject patterns) ---"

post '{"sender":"sales@growfast.io","from":"Brad from GrowFast <sales@growfast.io>","subject":"Quick question about scaling your team","bodyPreview":"Hi there! I noticed your company is growing fast. Would love to discuss how we can help."}'

post '{"sender":"recruiter@talentcorp.com","from":"Sarah at TalentCorp <recruiter@talentcorp.com>","subject":"Looking to connect","bodyPreview":"Hi! I came across your profile and would love to connect about some exciting opportunities."}'

post '{"sender":"partner@synergize.biz","from":"Jake from Synergize <partner@synergize.biz>","subject":"Partnership opportunity","bodyPreview":"We help companies like yours grow revenue 10x."}'

post '{"sender":"outreach@saashero.com","from":"Mike at SaaSHero <outreach@saashero.com>","subject":"Eelco?","bodyPreview":"Hey, just wanted to check if you got my last message."}'

post '{"sender":"bdr@pipeline.co","from":"Lisa from Pipeline <bdr@pipeline.co>","subject":"Let'\''s chat about your growth","bodyPreview":"I'\''d love to learn more about what you'\''re building and explore some synergies."}'

post '{"sender":"founders@startupclub.io","from":"Startup Club <founders@startupclub.io>","subject":"Following up on our intro","bodyPreview":"Just circling back on my earlier email. Would be great to find 15 minutes for a quick call."}'

echo ""
echo "--- cold_outreach (body patterns) ---"

post '{"sender":"demo@toolify.com","from":"Alex at Toolify <demo@toolify.com>","subject":"Saw your recent launch","bodyPreview":"Congrats on the launch! Would love to show you how we can help. Book a time here: calendly.com/alex-toolify"}'

post '{"sender":"sales@crmsuite.io","from":"CRM Suite Sales <sales@crmsuite.io>","subject":"Perfect timing","bodyPreview":"I think our product would be a great fit. Schedule a call at cal.com/crmsuite to learn more."}'

post '{"sender":"outreach@b2btool.dev","from":"B2B Tool <outreach@b2btool.dev>","subject":"For your team","bodyPreview":"We built something your engineering team will love. Check availability at hubspot.com/meetings/b2btool"}'

echo ""
echo "--- newsletter ---"

post '{"sender":"news@weekly.dev","from":"Weekly Dev Digest <news@weekly.dev>","subject":"Weekly Digest #42","bodyPreview":"This week in tech: React 20 released, Bun hits 2.0, and more...","headers":{"list-unsubscribe":"<https://weekly.dev/unsubscribe>"}}'

post '{"sender":"hello@tldr.tech","from":"TLDR <hello@tldr.tech>","subject":"TLDR Newsletter 2026-04-09","bodyPreview":"Today: GitHub Copilot gets agents, Cloudflare launches new AI features...","headers":{"list-unsubscribe":"<mailto:unsubscribe@tldr.tech>"}}'

post '{"sender":"digest@hackernews.com","from":"Hacker News Digest <digest@hackernews.com>","subject":"Top stories this week","bodyPreview":"1. Show HN: I built a cold email filter 2. Why SQLite is the future...","headers":{"List-Unsubscribe":"<https://hackernews.com/unsubscribe>"}}'

echo ""
echo "--- spam (failed auth) ---"

post '{"sender":"prize@totallylegit.xyz","from":"Prize Department <prize@totallylegit.xyz>","subject":"You have won $1,000,000!!!","bodyPreview":"Click here to claim your prize now! Act fast before the offer expires!","spfPass":false,"dkimPass":false}'

post '{"sender":"admin@y0urbank.com","from":"Your Bank Security <admin@y0urbank.com>","subject":"Urgent: Verify your account","bodyPreview":"We detected suspicious activity. Click here to verify your identity immediately.","spfPass":false,"dkimPass":false}'

post '{"sender":"deals@ch3ap-meds.net","from":"Online Pharmacy <deals@ch3ap-meds.net>","subject":"80% OFF today only!!!","bodyPreview":"Best prices on all medications. No prescription needed. Order now!","spfPass":false,"dkimPass":false}'

echo ""
echo "--- spam (high CF spam score) ---"

post '{"sender":"info@spamfarm.ru","from":"Special Offer <info@spamfarm.ru>","subject":"Make money from home","bodyPreview":"Earn $5000/day working from home with this one simple trick!","headers":{"x-cf-spamh-score":"85"}}'

echo ""
echo "--- unknown (freemail + vague subject) ---"

post '{"sender":"bob@gmail.com","from":"Bob Smith <bob@gmail.com>","subject":"Hello","bodyPreview":"Hey, just wanted to reach out and say hi."}'

post '{"sender":"jane@outlook.com","from":"Jane Doe <jane@outlook.com>","subject":"Question","bodyPreview":"I had a question about something I saw on your website."}'

post '{"sender":"stranger@yahoo.com","from":"stranger@yahoo.com","subject":"Help","bodyPreview":"Can you help me with something?"}'

echo ""
echo "Done! Seeded emails for all classification types."
echo "View at $BASE/api/emails?status=pending"
