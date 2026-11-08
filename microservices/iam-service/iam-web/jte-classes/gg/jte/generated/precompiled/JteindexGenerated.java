package gg.jte.generated.precompiled;
@SuppressWarnings("unchecked")
@javax.annotation.processing.Generated("gg.jte.TemplateEngine")
public final class JteindexGenerated {
	public static final String JTE_NAME = "index.jte";
	public static final int[] JTE_LINE_INFO = {0,0,0,0,0,0,0,8,8,8,8,8,8,8,8,8,12,12,12,18,18,18,24,24,24,26,26,27,27,27,28,28,29,29,30,30,30,31,31,33,33,33,33,33,33,34,34,34,34,34,34,35,35,35,35,35,35,36,36,36,36,36,36,37,37,38,38,38,38,38,38,39,39,40,40,41,41,41,41,41,41,42,42,44,44,44,45,45,46,46,46,47,47,50,50,50,52,52,53,53,53,54,54,58,58,58,59,59,59,60,60,60,61,61,61,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,66,66,66,71,0,0,0,1,2,3,4,5,6,0,0,0};
	public static void render(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, String> i18n, String currentLanguage, kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult user, kh.eco.istad.platform.authorization.domain.dto.user.result.UserAuthoritiesResult authorities, org.springframework.security.web.csrf.CsrfToken csrf, String successKey, String errorKey) {
		jteOutput.writeContent("<!doctype html>\n<html");
		var __jte_html_attribute_0 = currentLanguage;
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_0)) {
			jteOutput.writeContent(" lang=\"");
			jteOutput.setContext("html", "lang");
			jteOutput.writeUserContent(__jte_html_attribute_0);
			jteOutput.setContext("html", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n<head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <title>");
		jteOutput.setContext("title", null);
		jteOutput.writeUserContent(i18n.get("profile.title"));
		jteOutput.writeContent("</title>\n    <link rel=\"stylesheet\" href=\"/iam.css\">\n</head>\n<body>\n<main class=\"card wide\">\n    <header>\n        <a href=\"/\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("common.appName"));
		jteOutput.writeContent("</a>\n        <nav>\n            <a href=\"?lang=en\">EN</a> · <a href=\"?lang=km\">ខ្មែរ</a>\n        </nav>\n    </header>\n\n    <h1>");
		jteOutput.setContext("h1", null);
		jteOutput.writeUserContent(i18n.get("profile.title"));
		jteOutput.writeContent("</h1>\n\n    ");
		if (successKey != null) {
			jteOutput.writeContent("\n        <p class=\"success\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get(successKey));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n    ");
		if (errorKey != null) {
			jteOutput.writeContent("\n        <p class=\"error\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get(errorKey));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n\n    <p><b>");
		jteOutput.setContext("b", null);
		jteOutput.writeUserContent(i18n.get("profile.username"));
		jteOutput.writeContent(":</b> ");
		jteOutput.setContext("p", null);
		jteOutput.writeUserContent(user.username());
		jteOutput.writeContent("</p>\n    <p><b>");
		jteOutput.setContext("b", null);
		jteOutput.writeUserContent(i18n.get("profile.email"));
		jteOutput.writeContent(":</b> ");
		jteOutput.setContext("p", null);
		jteOutput.writeUserContent(user.email());
		jteOutput.writeContent("</p>\n    <p><b>");
		jteOutput.setContext("b", null);
		jteOutput.writeUserContent(i18n.get("register.givenName"));
		jteOutput.writeContent(":</b> ");
		jteOutput.setContext("p", null);
		jteOutput.writeUserContent(user.givenName());
		jteOutput.writeContent("</p>\n    <p><b>");
		jteOutput.setContext("b", null);
		jteOutput.writeUserContent(i18n.get("register.familyName"));
		jteOutput.writeContent(":</b> ");
		jteOutput.setContext("p", null);
		jteOutput.writeUserContent(user.familyName());
		jteOutput.writeContent("</p>\n    ");
		if (user.middleName() != null) {
			jteOutput.writeContent("\n        <p><b>");
			jteOutput.setContext("b", null);
			jteOutput.writeUserContent(i18n.get("edit.middleName"));
			jteOutput.writeContent(":</b> ");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(user.middleName());
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n    ");
		if (user.nickname() != null) {
			jteOutput.writeContent("\n        <p><b>");
			jteOutput.setContext("b", null);
			jteOutput.writeUserContent(i18n.get("edit.nickname"));
			jteOutput.writeContent(":</b> ");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(user.nickname());
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n    <p>\n        <b>");
		jteOutput.setContext("b", null);
		jteOutput.writeUserContent(i18n.get("profile.roles"));
		jteOutput.writeContent(":</b>\n        ");
		for (var role : user.roles()) {
			jteOutput.writeContent("\n            <span class=\"tag\">");
			jteOutput.setContext("span", null);
			jteOutput.writeUserContent(role.name());
			jteOutput.writeContent("</span>\n        ");
		}
		jteOutput.writeContent("\n    </p>\n\n    <h2>");
		jteOutput.setContext("h2", null);
		jteOutput.writeUserContent(i18n.get("profile.permissions"));
		jteOutput.writeContent("</h2>\n    <ul>\n        ");
		for (var permission : authorities.effectivePermissions()) {
			jteOutput.writeContent("\n            <li>");
			jteOutput.setContext("li", null);
			jteOutput.writeUserContent(permission);
			jteOutput.writeContent("</li>\n        ");
		}
		jteOutput.writeContent("\n    </ul>\n\n    <div class=\"actions\">\n        <a class=\"button\" href=\"/profile/edit\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("profile.edit"));
		jteOutput.writeContent("</a>\n        <a class=\"button\" href=\"/profile/password\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("password.title"));
		jteOutput.writeContent("</a>\n        <a class=\"button\" href=\"/profile/accounts\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("profile.linkedAccounts"));
		jteOutput.writeContent("</a>\n        <a class=\"button\" href=\"/profile/apps\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("profile.connectedApps"));
		jteOutput.writeContent("</a>\n    </div>\n\n    <form method=\"post\" action=\"/logout\">\n        <input type=\"hidden\"");
		var __jte_html_attribute_1 = csrf.getParameterName();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_1)) {
			jteOutput.writeContent(" name=\"");
			jteOutput.setContext("input", "name");
			jteOutput.writeUserContent(__jte_html_attribute_1);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		var __jte_html_attribute_2 = csrf.getToken();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_2)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_2);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        <button class=\"secondary\">");
		jteOutput.setContext("button", null);
		jteOutput.writeUserContent(i18n.get("common.logout"));
		jteOutput.writeContent("</button>\n    </form>\n</main>\n</body>\n</html>\n");
	}
	public static void renderMap(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, Object> params) {
		java.util.Map<String, String> i18n = (java.util.Map<String, String>)params.get("i18n");
		String currentLanguage = (String)params.get("currentLanguage");
		kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult user = (kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult)params.get("user");
		kh.eco.istad.platform.authorization.domain.dto.user.result.UserAuthoritiesResult authorities = (kh.eco.istad.platform.authorization.domain.dto.user.result.UserAuthoritiesResult)params.get("authorities");
		org.springframework.security.web.csrf.CsrfToken csrf = (org.springframework.security.web.csrf.CsrfToken)params.get("csrf");
		String successKey = (String)params.get("successKey");
		String errorKey = (String)params.get("errorKey");
		render(jteOutput, jteHtmlInterceptor, i18n, currentLanguage, user, authorities, csrf, successKey, errorKey);
	}
}
