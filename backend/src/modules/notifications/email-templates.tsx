import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { render, toPlainText } from '@react-email/render';

const colors = {
  brand: '#00653B',
  dark: '#041603',
  lime: '#D8FF3E',
  page: '#F5F7FA',
  muted: '#64748B',
  border: '#E2E8F0',
};

type EmailContent = {
  preview: string;
  eyebrow: string;
  title: string;
  greeting: string;
  paragraphs: string[];
  action?: { label: string; url: string };
  detailLabel?: string;
  detailValue?: string;
  footnote?: string;
};

function BeleqetEmail(props: EmailContent) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{props.preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>BELEQET</Text>
            <Text style={styles.tagline}>Work. Talent. Opportunity.</Text>
          </Section>
          <Section style={styles.content}>
            <Text style={styles.eyebrow}>{props.eyebrow}</Text>
            <Heading as="h1" style={styles.heading}>{props.title}</Heading>
            <Text style={styles.text}>{props.greeting}</Text>
            {props.paragraphs.map((paragraph) => (
              <Text key={paragraph} style={styles.text}>{paragraph}</Text>
            ))}
            {props.detailValue && (
              <Section style={styles.detail}>
                <Text style={styles.detailLabel}>{props.detailLabel}</Text>
                <Text style={styles.detailValue}>{props.detailValue}</Text>
              </Section>
            )}
            {props.action && (
              <Section style={styles.actionRow}>
                <Button href={props.action.url} style={styles.button}>
                  {props.action.label}
                </Button>
              </Section>
            )}
            {props.footnote && <Text style={styles.footnote}>{props.footnote}</Text>}
          </Section>
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              You received this transactional email because you have a Beleqet account or
              interacted with a job listing on Beleqet.
            </Text>
            <Text style={styles.footerText}>
              <Link href="https://beleqet-interview-task-mu.vercel.app" style={styles.footerLink}>
                Visit Beleqet
              </Link>
              {' · '}Addis Ababa, Ethiopia
            </Text>
            <Hr style={styles.hr} />
            <Text style={styles.copyright}>© {new Date().getFullYear()} Beleqet. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

async function renderTemplate(content: EmailContent) {
  const html = await render(<BeleqetEmail {...content} />);
  return { html, text: toPlainText(html) };
}

export function verificationEmail(firstName: string, verifyUrl: string) {
  return renderTemplate({
    preview: 'Verify your email to finish setting up your Beleqet account.',
    eyebrow: 'Account verification',
    title: 'Confirm your email address',
    greeting: `Hello ${firstName},`,
    paragraphs: ['Welcome to Beleqet. Verify your email address to secure your account and access all platform features.'],
    action: { label: 'Verify email address', url: verifyUrl },
    footnote: 'This verification link expires in 24 hours. If you did not create this account, you can ignore this email.',
  });
}

export function passwordResetEmail(firstName: string, resetUrl: string) {
  return renderTemplate({
    preview: 'Use this secure link to reset your Beleqet password.',
    eyebrow: 'Account security',
    title: 'Reset your password',
    greeting: `Hello ${firstName},`,
    paragraphs: ['We received a request to reset your Beleqet password. Use the secure button below to choose a new password.'],
    action: { label: 'Reset password', url: resetUrl },
    footnote: 'This link expires in one hour. If you did not request a password reset, no action is required.',
  });
}

export function applicationReceivedEmail(input: {
  firstName: string;
  jobTitle: string;
  companyName: string;
  applicationUrl: string;
}) {
  return renderTemplate({
    preview: `Your application for ${input.jobTitle} has been received.`,
    eyebrow: 'Application submitted',
    title: 'Your application is on its way',
    greeting: `Hello ${input.firstName},`,
    paragraphs: [`We received your application and shared it with ${input.companyName}. You can track its progress from your application dashboard.`],
    detailLabel: 'Position',
    detailValue: input.jobTitle,
    action: { label: 'Track application', url: input.applicationUrl },
  });
}

export function recruiterApplicationEmail(input: {
  firstName: string;
  applicantName: string;
  jobTitle: string;
  applicationUrl: string;
}) {
  return renderTemplate({
    preview: `${input.applicantName} applied for ${input.jobTitle}.`,
    eyebrow: 'New candidate',
    title: 'A new application has arrived',
    greeting: `Hello ${input.firstName},`,
    paragraphs: [`${input.applicantName} submitted an application for your open position. Review their profile and application materials in your hiring workspace.`],
    detailLabel: 'Position',
    detailValue: input.jobTitle,
    action: { label: 'Review applicant', url: input.applicationUrl },
  });
}

export function applicationStatusEmail(input: {
  firstName: string;
  jobTitle: string;
  status: string;
  applicationUrl: string;
}) {
  const readableStatus = input.status.replaceAll('_', ' ').toLowerCase();
  return renderTemplate({
    preview: `Your application status for ${input.jobTitle} has changed.`,
    eyebrow: 'Application update',
    title: 'Your application status changed',
    greeting: `Hello ${input.firstName},`,
    paragraphs: [`There is a new update from the hiring team regarding your application for ${input.jobTitle}.`],
    detailLabel: 'Current status',
    detailValue: readableStatus.charAt(0).toUpperCase() + readableStatus.slice(1),
    action: { label: 'View application', url: input.applicationUrl },
  });
}

const styles: Record<string, React.CSSProperties> = {
  body: { backgroundColor: colors.page, color: colors.dark, fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: '32px 12px' },
  container: { backgroundColor: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: '18px', margin: '0 auto', maxWidth: '600px', overflow: 'hidden' },
  header: { backgroundColor: colors.dark, padding: '28px 36px' },
  logo: { color: colors.lime, fontSize: '22px', fontWeight: 800, letterSpacing: '2px', margin: 0 },
  tagline: { color: '#FFFFFF', fontSize: '12px', margin: '5px 0 0', opacity: 0.7 },
  content: { padding: '36px' },
  eyebrow: { color: colors.brand, fontSize: '12px', fontWeight: 700, letterSpacing: '1.4px', margin: '0 0 10px', textTransform: 'uppercase' },
  heading: { color: colors.dark, fontSize: '30px', lineHeight: '1.2', margin: '0 0 24px' },
  text: { color: '#334155', fontSize: '16px', lineHeight: '1.65', margin: '0 0 16px' },
  detail: { backgroundColor: '#F7F9F8', borderLeft: `4px solid ${colors.brand}`, borderRadius: '8px', margin: '24px 0', padding: '16px 18px' },
  detailLabel: { color: colors.muted, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', margin: '0 0 5px', textTransform: 'uppercase' },
  detailValue: { color: colors.dark, fontSize: '17px', fontWeight: 700, margin: 0, textTransform: 'capitalize' },
  actionRow: { margin: '28px 0 20px' },
  button: { backgroundColor: colors.brand, borderRadius: '999px', color: '#FFFFFF', display: 'inline-block', fontSize: '15px', fontWeight: 700, padding: '13px 24px', textDecoration: 'none' },
  footnote: { color: colors.muted, fontSize: '13px', lineHeight: '1.55', margin: '22px 0 0' },
  footer: { backgroundColor: '#F7F9F8', borderTop: `1px solid ${colors.border}`, padding: '24px 36px' },
  footerText: { color: colors.muted, fontSize: '12px', lineHeight: '1.55', margin: '0 0 8px' },
  footerLink: { color: colors.brand, fontWeight: 700, textDecoration: 'none' },
  hr: { borderColor: colors.border, margin: '18px 0' },
  copyright: { color: '#94A3B8', fontSize: '11px', margin: 0 },
};
