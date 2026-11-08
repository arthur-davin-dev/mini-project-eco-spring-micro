@param java.util.Map<String, String> i18n
@param String currentLanguage
@param boolean githubEnabled
@param boolean googleEnabled
@param boolean facebookEnabled
@param boolean telegramEnabled
@param boolean oauthError
@param boolean registered
@param boolean badCredentials
@param org.springframework.security.web.csrf.CsrfToken csrf
<!doctype html>
<html lang="${currentLanguage}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${i18n.get("login.title")}</title>
    <link rel="stylesheet" href="/iam.css">
</head>
<body>
<main class="card">
    <header>
        <a href="/">${i18n.get("common.appName")}</a>
        <nav>
            <a href="?lang=en">EN</a> · <a href="?lang=km">ខ្មែរ</a>
        </nav>
    </header>

    <h1>${i18n.get("login.title")}</h1>
    <p>${i18n.get("login.subtitle")}</p>

    @if(oauthError)
        <p class="error" role="alert">${i18n.get("login.oauthError")}</p>
    @endif
    @if(registered)
        <p class="success" role="status">${i18n.get("login.registered")}</p>
    @endif
    @if(badCredentials)
        <p class="error" role="alert">${i18n.get("login.badCredentials")}</p>
    @endif

    <form method="post" action="/login">
        <input type="hidden" name="${csrf.getParameterName()}" value="${csrf.getToken()}">

        <label>
            ${i18n.get("login.username")}
            <input name="username" autocomplete="username" required>
        </label>
        <label>
            ${i18n.get("login.password")}
            <input type="password" name="password" autocomplete="current-password" required>
        </label>

        <button>${i18n.get("login.signIn")}</button>
    </form>

    <p><a href="/register">${i18n.get("login.register")}</a></p>

    @if(githubEnabled || googleEnabled || facebookEnabled || telegramEnabled)
        <hr>
        <p>${i18n.get("login.orContinue")}</p>
        <div class="actions">
            @if(githubEnabled)
                <a class="button" href="/oauth2/authorization/github">GitHub</a>
            @endif
            @if(googleEnabled)
                <a class="button" href="/oauth2/authorization/google">Google</a>
            @endif
            @if(facebookEnabled)
                <a class="button" href="/oauth2/authorization/facebook">Facebook</a>
            @endif
            @if(telegramEnabled)
                <a class="button" href="/oauth2/authorization/telegram">Telegram</a>
            @endif
        </div>
    @endif
</main>
</body>
</html>