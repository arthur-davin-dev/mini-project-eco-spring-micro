package gg.jte.generated.precompiled;
@SuppressWarnings("unchecked")
@javax.annotation.processing.Generated("gg.jte.TemplateEngine")
public final class JteprofileeditGenerated {
	public static final String JTE_NAME = "profile-edit.jte";
	public static final int[] JTE_LINE_INFO = {0,0,0,0,0,0,0,8,8,8,8,8,8,8,8,8,12,12,12,18,18,18,24,24,24,26,26,27,27,27,28,28,29,29,30,30,30,31,31,32,32,33,33,33,34,34,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,37,40,40,40,41,41,41,41,41,41,41,41,41,44,44,44,45,45,45,45,45,45,45,45,45,48,48,48,49,49,49,49,49,49,49,49,49,52,52,52,53,53,53,53,53,53,53,53,53,56,56,56,57,57,57,57,57,57,57,57,57,60,60,60,61,61,61,61,61,61,61,61,61,64,64,64,65,65,65,65,65,65,65,65,65,69,69,69,70,70,70,70,70,70,70,70,70,73,73,73,74,74,74,74,74,74,74,74,74,77,77,77,78,78,78,78,78,78,78,78,78,83,83,83,85,85,86,86,86,87,87,88,88,88,89,89,90,90,91,91,91,92,92,93,93,93,94,94,99,99,99,100,100,100,100,100,100,100,100,100,103,103,103,104,104,104,104,104,104,104,104,104,107,107,107,108,108,108,108,108,108,108,108,108,111,111,111,112,112,112,112,112,112,112,112,112,115,115,115,116,116,116,116,116,116,116,116,116,119,119,119,120,120,120,125,0,0,0,1,2,3,4,5,6,0,0,0};
	public static void render(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, String> i18n, String currentLanguage, kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult user, org.springframework.security.web.csrf.CsrfToken csrf, String successKey, String errorKey, String errorMessage) {
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
		jteOutput.writeUserContent(i18n.get("edit.title"));
		jteOutput.writeContent("</title>\n    <link rel=\"stylesheet\" href=\"/iam.css\">\n</head>\n<body>\n<main class=\"card wide\">\n    <header>\n        <a href=\"/\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("common.home"));
		jteOutput.writeContent("</a>\n        <nav>\n            <a href=\"?lang=en\">EN</a> · <a href=\"?lang=km\">ខ្មែរ</a>\n        </nav>\n    </header>\n\n    <h1>");
		jteOutput.setContext("h1", null);
		jteOutput.writeUserContent(i18n.get("edit.title"));
		jteOutput.writeContent("</h1>\n\n    ");
		if (errorKey != null) {
			jteOutput.writeContent("\n        <p class=\"error\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get(errorKey));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n    ");
		if (errorMessage != null) {
			jteOutput.writeContent("\n        <p class=\"error\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(errorMessage);
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n    ");
		if (successKey != null) {
			jteOutput.writeContent("\n        <p class=\"success\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get(successKey));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n\n    <form method=\"post\" action=\"/profile/edit\">\n        <input type=\"hidden\"");
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
		jteOutput.writeContent(">\n\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("register.givenName"));
		jteOutput.writeContent("\n            <input name=\"givenName\"");
		var __jte_html_attribute_3 = user.givenName();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_3)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_3);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(" required>\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("register.familyName"));
		jteOutput.writeContent("\n            <input name=\"familyName\"");
		var __jte_html_attribute_4 = user.familyName();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_4)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_4);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(" required>\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.middleName"));
		jteOutput.writeContent("\n            <input name=\"middleName\"");
		var __jte_html_attribute_5 = user.middleName();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_5)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_5);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.nickname"));
		jteOutput.writeContent("\n            <input name=\"nickname\"");
		var __jte_html_attribute_6 = user.nickname();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_6)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_6);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.gender"));
		jteOutput.writeContent("\n            <input name=\"gender\"");
		var __jte_html_attribute_7 = user.gender();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_7)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_7);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.birthdate"));
		jteOutput.writeContent("\n            <input type=\"date\" name=\"birthdate\"");
		var __jte_html_attribute_8 = user.birthdate() == null ? "" : user.birthdate().toString();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_8)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_8);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.phone"));
		jteOutput.writeContent("\n            <input type=\"tel\" name=\"phoneNumber\"");
		var __jte_html_attribute_9 = user.phoneNumber();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_9)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_9);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent("\n                   pattern=\"\\+[1-9][0-9]{6,14}\" title=\"+85512345678\">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.picture"));
		jteOutput.writeContent("\n            <input type=\"url\" name=\"pictureUrl\"");
		var __jte_html_attribute_10 = user.pictureUrl();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_10)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_10);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.website"));
		jteOutput.writeContent("\n            <input type=\"url\" name=\"websiteUrl\"");
		var __jte_html_attribute_11 = user.websiteUrl();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_11)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_11);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.profileUrl"));
		jteOutput.writeContent("\n            <input type=\"url\" name=\"profileUrl\"");
		var __jte_html_attribute_12 = user.profileUrl();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_12)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_12);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n\n\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.locale"));
		jteOutput.writeContent("\n            <select name=\"locale\">\n                ");
		if ("en".equals(user.locale())) {
			jteOutput.writeContent("\n                    <option value=\"en\" selected>");
			jteOutput.setContext("option", null);
			jteOutput.writeUserContent(i18n.get("locale.en"));
			jteOutput.writeContent("</option>\n                ");
		} else {
			jteOutput.writeContent("\n                    <option value=\"en\">");
			jteOutput.setContext("option", null);
			jteOutput.writeUserContent(i18n.get("locale.en"));
			jteOutput.writeContent("</option>\n                ");
		}
		jteOutput.writeContent("\n                ");
		if ("km".equals(user.locale())) {
			jteOutput.writeContent("\n                    <option value=\"km\" selected>");
			jteOutput.setContext("option", null);
			jteOutput.writeUserContent(i18n.get("locale.km"));
			jteOutput.writeContent("</option>\n                ");
		} else {
			jteOutput.writeContent("\n                    <option value=\"km\">");
			jteOutput.setContext("option", null);
			jteOutput.writeUserContent(i18n.get("locale.km"));
			jteOutput.writeContent("</option>\n                ");
		}
		jteOutput.writeContent("\n            </select>\n        </label>\n\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.street"));
		jteOutput.writeContent("\n            <input name=\"streetAddress\"");
		var __jte_html_attribute_13 = user.address() == null ? "" : user.address().streetAddress();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_13)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_13);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.locality"));
		jteOutput.writeContent("\n            <input name=\"locality\"");
		var __jte_html_attribute_14 = user.address() == null ? "" : user.address().locality();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_14)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_14);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.region"));
		jteOutput.writeContent("\n            <input name=\"region\"");
		var __jte_html_attribute_15 = user.address() == null ? "" : user.address().region();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_15)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_15);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.postalCode"));
		jteOutput.writeContent("\n            <input name=\"postalCode\"");
		var __jte_html_attribute_16 = user.address() == null ? "" : user.address().postalCode();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_16)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_16);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("edit.country"));
		jteOutput.writeContent("\n            <input name=\"country\" maxlength=\"2\"");
		var __jte_html_attribute_17 = user.address() == null ? "" : user.address().country();
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_17)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_17);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n        </label>\n\n        <button>");
		jteOutput.setContext("button", null);
		jteOutput.writeUserContent(i18n.get("common.save"));
		jteOutput.writeContent("</button>\n        <a class=\"button secondary\" href=\"/\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("common.cancel"));
		jteOutput.writeContent("</a>\n    </form>\n</main>\n</body>\n</html>\n");
	}
	public static void renderMap(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, Object> params) {
		java.util.Map<String, String> i18n = (java.util.Map<String, String>)params.get("i18n");
		String currentLanguage = (String)params.get("currentLanguage");
		kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult user = (kh.eco.istad.platform.authorization.domain.dto.user.result.UserResult)params.get("user");
		org.springframework.security.web.csrf.CsrfToken csrf = (org.springframework.security.web.csrf.CsrfToken)params.get("csrf");
		String successKey = (String)params.get("successKey");
		String errorKey = (String)params.get("errorKey");
		String errorMessage = (String)params.get("errorMessage");
		render(jteOutput, jteHtmlInterceptor, i18n, currentLanguage, user, csrf, successKey, errorKey, errorMessage);
	}
}
