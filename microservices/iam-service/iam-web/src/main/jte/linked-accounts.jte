@param java.util.Map<String, String> i18n
@param String currentLanguage
@param java.util.List<kh.eco.istad.platform.authorization.domain.dto.identity.result.IdentityResult> identities
@param java.util.List<String> linkableProviders
@param org.springframework.security.web.csrf.CsrfToken csrf
@param String successKey
@param String errorKey
<!doctype html>
<html lang="${currentLanguage}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${i18n.get("accounts.title")}</title>
    <link rel="stylesheet" href="/iam.css">
</head>
<body>
<main class="card wide">
    <header>
        <a href="/">${i18n.get("common.home")}</a>
        <nav>
            <a href="?lang=en">EN</a> · <a href="?lang=km">ខ្មែរ</a>
        </nav>
    </header>

    <h1>${i18n.get("accounts.title")}</h1>

    @if(successKey != null)
        <p class="success">${i18n.get(successKey)}</p>
    @endif
    @if(errorKey != null)
        <p class="error">${i18n.get(errorKey)}</p>
    @endif

    @if(!linkableProviders.isEmpty())
        <h2>${i18n.get("accounts.link")}</h2>
        <div class="actions">
            @for(var provider : linkableProviders)
                <form method="post" action="/profile/accounts/link/${provider}">
                    <input type="hidden" name="${csrf.getParameterName()}" value="${csrf.getToken()}">
                    <button>${i18n.get("accounts.link")} ${provider}</button>
                </form>
            @endfor
        </div>
    @endif

    @if(identities.isEmpty())
        <p>${i18n.get("common.empty")}</p>
    @else
        <table>
            <thead>
            <tr>
                <th>${i18n.get("accounts.provider")}</th>
                <th>${i18n.get("accounts.email")}</th>
                <th>${i18n.get("accounts.linkedAt")}</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            @for(var identity : identities)
                <tr>
                    <td>${identity.provider().name()}</td>
                    <td>${identity.email()}</td>
                    <td>${identity.linkedAt().toString()}</td>
                    <td>
                        <form method="post" action="/profile/accounts/${identity.uuid().toString()}/unlink">
                            <input type="hidden" name="${csrf.getParameterName()}" value="${csrf.getToken()}">
                            <button class="danger">${i18n.get("accounts.unlink")}</button>
                        </form>
                    </td>
                </tr>
            @endfor
            </tbody>
        </table>
    @endif
</main>
</body>
</html>