По пункту 1: 
Вроде это: 
postgresql://neondb_owner:npg_qW8KulcMTE4b@ep-bold-thunder-aly8yjvm.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require


По пункту 2: 

PS D:\fit> npx auth secret
Need to install the following packages:
auth@1.6.9
Ok to proceed? (y) y


Add the following to your .env file:
# Auth Secret
BETTER_AUTH_SECRET=30145311c52c9aedffc412551f21d508335aa1b2f57674d79de3cdf449f6e70e

Пункт 4: 

import { Resend } from 'resend';

const resend = new Resend('••••••••••••••••••••••••••••••••••••');

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'dlyauchebitpgu@gmail.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});
re_bXGBEr6f_6d2xmuEahNcpRDuQZmDAMeWD