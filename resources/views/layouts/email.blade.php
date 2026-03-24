<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('subject', 'Polsh')</title>
    <style>
        body { margin: 0; padding: 0; background: #0e0e0e; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .container { max-width: 520px; margin: 48px auto; background: #111111; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
        .header { padding: 28px 32px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .logo { font-size: 18px; font-weight: 700; color: #e0ff4f; letter-spacing: -0.02em; text-decoration: none; }
        .body { padding: 32px; }
        .title { font-size: 20px; font-weight: 600; color: #f0f0f0; margin: 0 0 12px; }
        .text { font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.6; margin: 0 0 16px; }
        .highlight { color: #e0ff4f; font-weight: 600; }
        .btn { display: inline-block; background: #e0ff4f; color: #080808; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 8px; }
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0; }
        .label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 6px; }
        .value { font-size: 14px; color: rgba(255,255,255,0.75); margin: 0 0 16px; }
        .footer { padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.08); }
        .footer-text { font-size: 12px; color: rgba(255,255,255,0.25); line-height: 1.5; margin: 0; }
        .link { color: rgba(224,255,79,0.7); word-break: break-all; }
        @media only screen and (max-width: 600px) {
            .container { margin: 16px; border-radius: 8px; }
            .body { padding: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="logo">polsh</span>
        </div>
        <div class="body">
            @yield('content')
        </div>
        <div class="footer">
            <p class="footer-text">
                @yield('footer-note', '&copy; ' . date('Y') . ' Polsh. All rights reserved.')
            </p>
        </div>
    </div>
</body>
</html>
