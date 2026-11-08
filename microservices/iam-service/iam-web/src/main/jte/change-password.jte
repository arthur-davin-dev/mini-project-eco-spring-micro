@param java.util.Map<String, String> i18n
@param String currentLanguage
@param org.springframework.security.web.csrf.CsrfToken csrf
@param String successKey
@param String errorKey
<!doctype html>
<html lang="${currentLanguage}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${i18n.get("password.title")}</title>
    <link rel="stylesheet" href="/iam.css">
</head>
<body>
<main class="card">
    <header>
        <a href="/">${i18n.get("common.home")}</a>
        <nav>
            <a href="?lang=en">EN</a> · <a href="?lang=km">ខ្មែរ</a>
        </nav>
    </header>

    <h1>${i18n.get("password.title")}</h1>

    @if(successKey != null)
        <p class="success">${i18n.get(successKey)}</p>
    @endif
    @if(errorKey != null)
        <p class="error">${i18n.get(errorKey)}</p>
    @endif

    <form method="post" action="/profile/password">
        <input type="hidden" name="${csrf.getParameterName()}" value="${csrf.getToken()}">

        <label>
            ${i18n.get("password.current")}
            <input type="password" name="currentPassword" autocomplete="current-password" required>
        </label>
        <label>
            ${i18n.get("password.new")}
            <input type="password" name="newPassword" autocomplete="new-password" required>
        </label>
        <label>
            ${i18n.get("password.confirm")}
            <input type="password" name="confirmPassword" autocomplete="new-password" required>
        </label>

        <button>${i18n.get("password.submit")}</button>
    </form>
</main>
</body>
</html>