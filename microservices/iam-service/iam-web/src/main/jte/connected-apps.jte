@param java.util.Map<String, String> i18n
@param String currentLanguage
@param java.util.List<kh.eco.istad.iam.web.controller.ConnectedApplicationView> apps
@param org.springframework.security.web.csrf.CsrfToken csrf
@param String successKey
<!doctype html>
<html lang="${currentLanguage}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${i18n.get("apps.title")}</title>
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

    <h1>${i18n.get("apps.title")}</h1>

    @if(successKey != null)
        <p class="success">${i18n.get(successKey)}</p>
    @endif

    @if(apps.isEmpty())
        <p>${i18n.get("common.empty")}</p>
    @else
        <table>
            <thead>
            <tr>
                <th>${i18n.get("apps.client")}</th>
                <th>${i18n.get("apps.scopes")}</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            @for(var app : apps)
                <tr>
                    <td>${app.clientName()}</td>
                    <td>${String.join(", ", app.scopes())}</td>
                    <td>
                        <form method="post" action="/profile/apps/${app.registeredClientId()}/revoke">
                            <input type="hidden" name="${csrf.getParameterName()}" value="${csrf.getToken()}">
                            <button class="danger">${i18n.get("apps.revoke")}</button>
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