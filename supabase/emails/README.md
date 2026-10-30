# E-mails de autenticação do Supabase

Modelos com a marca Psicoterapia e Afins. O assunto de cada um está no comentário
no topo do arquivo. Cole assunto e corpo (a partir de `<!DOCTYPE html>`, aba Source)
em Authentication > Email Templates do projeto Intervenções. Mantenha as variáveis
`{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .Email }}` e `{{ .NewEmail }}`.

| Arquivo | Template no Supabase |
|---|---|
| `convite.html` | Invite user |
| `confirmar-email.html` | Confirm sign up |
| `redefinir-senha.html` | Reset password |
| `magic-link.html` | Magic Link |
| `trocar-email.html` | Change Email Address |
| `reautenticacao.html` | Reauthentication |

A logo vem de `farol/logo-completa.png`, servida pelo GitHub Pages.
