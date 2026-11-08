@param java.util.Map<String, String> i18n
@param String currentLanguage
@param org.springframework.security.web.csrf.CsrfToken csrf
@param String formError
<!doctype html>
<html lang="${currentLanguage}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${i18n.get("register.title")}</title>
    <link rel="stylesheet" href="/iam.css">
</head>
<body>
<main class="card">
    <header>
        <a href="/login">${i18n.get("common.appName")}</a>
        <nav>
            <a href="?lang=en">EN</a> · <a href="?lang=km">ខ្មែរ</a>
        </nav>
    </header>

    <h1>${i18n.get("register.title")}</h1>

    @if(formError != null)
        <p class="error">${i18n.get(formError)}</p>
    @endif

    <form method="post" action="/register">
        <input type="hidden" name="${csrf.getParameterName()}" value="${csrf.getToken()}">
        <input type="hidden" name="locale" value="${currentLanguage}">

        <label>
            ${i18n.get("login.username")}
            <input name="username" required minlength="3" maxlength="50">
        </label>
        <label>
            ${i18n.get("register.email")}
            <input type="email" name="email" required>
        </label>
        <label>
            ${i18n.get("register.givenName")}
            <input name="givenName" required>
        </label>
        <label>
            ${i18n.get("register.familyName")}
            <input name="familyName" required>
        </label>
        <label>
            ${i18n.get("login.password")}
            <input type="password" name="password" required autocomplete="new-password">
        </label>
        <label>
            ${i18n.get("register.confirmPassword")}
            <input type="password" name="confirmPassword" required autocomplete="new-password">
        </label>

        <button>${i18n.get("register.submit")}</button>
    </form>

    <p><a href="/login">${i18n.get("login.signIn")}</a></p>
</main>
</body>
</html>