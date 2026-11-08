@param java.util.Map<String, String> i18n
@param String currentLanguage
@param kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult user
@param kh.eco.istad.platform.authorization.domain.dto.user.result.UserAuthoritiesResult authorities
@param org.springframework.security.web.csrf.CsrfToken csrf
@param String successKey
@param String errorKey
<!doctype html>
<html lang="${currentLanguage}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${i18n.get("profile.title")}</title>
    <link rel="stylesheet" href="/iam.css">
</head>
<body>
<main class="card wide">
    <header>
        <a href="/">${i18n.get("common.appName")}</a>
        <nav>
            <a href="?lang=en">EN</a> · <a href="?lang=km">ខ្មែរ</a>
        </nav>
    </header>

    <h1>${i18n.get("profile.title")}</h1>

    @if(successKey != null)
        <p class="success">${i18n.get(successKey)}</p>
    @endif
    @if(errorKey != null)
        <p class="error">${i18n.get(errorKey)}</p>
    @endif

    <p><b>${i18n.get("profile.username")}:</b> ${user.username()}</p>
    <p><b>${i18n.get("profile.email")}:</b> ${user.email()}</p>
    <p><b>${i18n.get("register.givenName")}:</b> ${user.givenName()}</p>
    <p><b>${i18n.get("register.familyName")}:</b> ${user.familyName()}</p>
    @if(user.middleName() != null)
        <p><b>${i18n.get("edit.middleName")}:</b> ${user.middleName()}</p>
    @endif
    @if(user.nickname() != null)
        <p><b>${i18n.get("edit.nickname")}:</b> ${user.nickname()}</p>
    @endif
    <p>
        <b>${i18n.get("profile.roles")}:</b>
        @for(var role : user.roles())
            <span class="tag">${role.name()}</span>
        @endfor
    </p>

    <h2>${i18n.get("profile.permissions")}</h2>
    <ul>
        @for(var permission : authorities.effectivePermissions())
            <li>${permission}</li>
        @endfor
    </ul>

    <div class="actions">
        <a class="button" href="/profile/edit">${i18n.get("profile.edit")}</a>
        <a class="button" href="/profile/password">${i18n.get("password.title")}</a>
        <a class="button" href="/profile/accounts">${i18n.get("profile.linkedAccounts")}</a>
        <a class="button" href="/profile/apps">${i18n.get("profile.connectedApps")}</a>
    </div>

    <form method="post" action="/logout">
        <input type="hidden" name="${csrf.getParameterName()}" value="${csrf.getToken()}">
        <button class="secondary">${i18n.get("common.logout")}</button>
    </form>
</main>
</body>
</html>
