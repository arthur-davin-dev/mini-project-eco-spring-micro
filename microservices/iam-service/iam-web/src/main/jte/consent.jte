@param java.util.Map<String, String> i18n
@param String currentLanguage
@param org.springframework.security.web.csrf.CsrfToken csrf
@param String clientId
@param String clientName
@param String state
@param java.util.List<String> scopes
@param String errorKey
<!doctype html>
<html lang="${currentLanguage}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${i18n.get("consent.title")}</title>
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

    <h1>${i18n.get("consent.title")}</h1>

    @if(errorKey != null)
        <p class="error" role="alert">${i18n.get(errorKey)}</p>
        <a class="button" href="/">${i18n.get("common.home")}</a>
    @else
        <p><b>${i18n.get("consent.client")}:</b> ${clientName}</p>
        <p>${i18n.get("consent.requestedScopes")}</p>

        <form method="post" action="/oauth2/authorize">
            <input type="hidden" name="${csrf.getParameterName()}" value="${csrf.getToken()}">
            <input type="hidden" name="client_id" value="${clientId}">
            <input type="hidden" name="state" value="${state}">

            @if(scopes.isEmpty())
                <p>${i18n.get("consent.noScopes")}</p>
            @endif
            @for(var scope : scopes)
                <label class="check">
                    <input type="checkbox" name="scope" value="${scope}" checked>
                    ${scope}
                </label>
            @endfor

            <button name="user_oauth_approval" value="true">${i18n.get("consent.allow")}</button>
            <button class="secondary" name="user_oauth_approval" value="false">${i18n.get("consent.cancel")}</button>
        </form>
    @endif
</main>
</body>
</html>
