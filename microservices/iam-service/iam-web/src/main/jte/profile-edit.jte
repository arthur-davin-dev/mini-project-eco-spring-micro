@param java.util.Map<String, String> i18n
@param String currentLanguage
@param kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult user
@param org.springframework.security.web.csrf.CsrfToken csrf
@param String successKey
@param String errorKey
@param String errorMessage
<!doctype html>
<html lang="${currentLanguage}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${i18n.get("edit.title")}</title>
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

    <h1>${i18n.get("edit.title")}</h1>

    @if(errorKey != null)
        <p class="error">${i18n.get(errorKey)}</p>
    @endif
    @if(errorMessage != null)
        <p class="error">${errorMessage}</p>
    @endif
    @if(successKey != null)
        <p class="success">${i18n.get(successKey)}</p>
    @endif

    <form method="post" action="/profile/edit">
        <input type="hidden" name="${csrf.getParameterName()}" value="${csrf.getToken()}">

        <label>
            ${i18n.get("register.givenName")}
            <input name="givenName" value="${user.givenName()}" required>
        </label>
        <label>
            ${i18n.get("register.familyName")}
            <input name="familyName" value="${user.familyName()}" required>
        </label>
        <label>
            ${i18n.get("edit.middleName")}
            <input name="middleName" value="${user.middleName()}">
        </label>
        <label>
            ${i18n.get("edit.nickname")}
            <input name="nickname" value="${user.nickname()}">
        </label>
        <label>
            ${i18n.get("edit.gender")}
            <input name="gender" value="${user.gender()}">
        </label>
        <label>
            ${i18n.get("edit.birthdate")}
            <input type="date" name="birthdate" value="${user.birthdate() == null ? "" : user.birthdate().toString()}">
        </label>
        <label>
            ${i18n.get("edit.phone")}
            <input type="tel" name="phoneNumber" value="${user.phoneNumber()}"
                   pattern="\+[1-9][0-9]{6,14}" title="+85512345678">
        </label>
        <label>
            ${i18n.get("edit.picture")}
            <input type="url" name="pictureUrl" value="${user.pictureUrl()}">
        </label>
        <label>
            ${i18n.get("edit.website")}
            <input type="url" name="websiteUrl" value="${user.websiteUrl()}">
        </label>
        <label>
            ${i18n.get("edit.profileUrl")}
            <input type="url" name="profileUrl" value="${user.profileUrl()}">
        </label>


        <label>
            ${i18n.get("edit.locale")}
            <select name="locale">
                @if("en".equals(user.locale()))
                    <option value="en" selected>${i18n.get("locale.en")}</option>
                @else
                    <option value="en">${i18n.get("locale.en")}</option>
                @endif
                @if("km".equals(user.locale()))
                    <option value="km" selected>${i18n.get("locale.km")}</option>
                @else
                    <option value="km">${i18n.get("locale.km")}</option>
                @endif
            </select>
        </label>

        <label>
            ${i18n.get("edit.street")}
            <input name="streetAddress" value="${user.address() == null ? "" : user.address().streetAddress()}">
        </label>
        <label>
            ${i18n.get("edit.locality")}
            <input name="locality" value="${user.address() == null ? "" : user.address().locality()}">
        </label>
        <label>
            ${i18n.get("edit.region")}
            <input name="region" value="${user.address() == null ? "" : user.address().region()}">
        </label>
        <label>
            ${i18n.get("edit.postalCode")}
            <input name="postalCode" value="${user.address() == null ? "" : user.address().postalCode()}">
        </label>
        <label>
            ${i18n.get("edit.country")}
            <input name="country" maxlength="2" value="${user.address() == null ? "" : user.address().country()}">
        </label>

        <button>${i18n.get("common.save")}</button>
        <a class="button secondary" href="/">${i18n.get("common.cancel")}</a>
    </form>
</main>
</body>
</html>
