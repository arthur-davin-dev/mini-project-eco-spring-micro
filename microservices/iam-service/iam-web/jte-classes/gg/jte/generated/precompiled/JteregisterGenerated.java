package gg.jte.generated.precompiled;
@SuppressWarnings("unchecked")
@javax.annotation.processing.Generated("gg.jte.TemplateEngine")
public final class JteregisterGenerated {
	public static final String JTE_NAME = "register.jte";
	public static final int[] JTE_LINE_INFO = {0,0,0,0,0,0,0,5,5,5,5,5,5,5,5,5,9,9,9,15,15,15,21,21,21,23,23,24,24,24,25,25,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,29,32,32,32,36,36,36,40,40,40,44,44,44,48,48,48,52,52,52,56,56,56,59,59,59,62,0,0,0,1,2,3,0,0,0};
	public static void render(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, String> i18n, String currentLanguage, org.springframework.security.web.csrf.CsrfToken csrf, String formError) {
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
		jteOutput.writeUserContent(i18n.get("register.title"));
		jteOutput.writeContent("</title>\n    <link rel=\"stylesheet\" href=\"/iam.css\">\n</head>\n<body>\n<main class=\"card\">\n    <header>\n        <a href=\"/login\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("common.appName"));
		jteOutput.writeContent("</a>\n        <nav>\n            <a href=\"?lang=en\">EN</a> · <a href=\"?lang=km\">ខ្មែរ</a>\n        </nav>\n    </header>\n\n    <h1>");
		jteOutput.setContext("h1", null);
		jteOutput.writeUserContent(i18n.get("register.title"));
		jteOutput.writeContent("</h1>\n\n    ");
		if (formError != null) {
			jteOutput.writeContent("\n        <p class=\"error\">");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get(formError));
			jteOutput.writeContent("</p>\n    ");
		}
		jteOutput.writeContent("\n\n    <form method=\"post\" action=\"/register\">\n        <input type=\"hidden\"");
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
		jteOutput.writeContent(">\n        <input type=\"hidden\" name=\"locale\"");
		var __jte_html_attribute_3 = currentLanguage;
		if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_3)) {
			jteOutput.writeContent(" value=\"");
			jteOutput.setContext("input", "value");
			jteOutput.writeUserContent(__jte_html_attribute_3);
			jteOutput.setContext("input", null);
			jteOutput.writeContent("\"");
		}
		jteOutput.writeContent(">\n\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("login.username"));
		jteOutput.writeContent("\n            <input name=\"username\" required minlength=\"3\" maxlength=\"50\">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("register.email"));
		jteOutput.writeContent("\n            <input type=\"email\" name=\"email\" required>\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("register.givenName"));
		jteOutput.writeContent("\n            <input name=\"givenName\" required>\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("register.familyName"));
		jteOutput.writeContent("\n            <input name=\"familyName\" required>\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("login.password"));
		jteOutput.writeContent("\n            <input type=\"password\" name=\"password\" required autocomplete=\"new-password\">\n        </label>\n        <label>\n            ");
		jteOutput.setContext("label", null);
		jteOutput.writeUserContent(i18n.get("register.confirmPassword"));
		jteOutput.writeContent("\n            <input type=\"password\" name=\"confirmPassword\" required autocomplete=\"new-password\">\n        </label>\n\n        <button>");
		jteOutput.setContext("button", null);
		jteOutput.writeUserContent(i18n.get("register.submit"));
		jteOutput.writeContent("</button>\n    </form>\n\n    <p><a href=\"/login\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("login.signIn"));
		jteOutput.writeContent("</a></p>\n</main>\n</body>\n</html>");
	}
	public static void renderMap(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, Object> params) {
		java.util.Map<String, String> i18n = (java.util.Map<String, String>)params.get("i18n");
		String currentLanguage = (String)params.get("currentLanguage");
		org.springframework.security.web.csrf.CsrfToken csrf = (org.springframework.security.web.csrf.CsrfToken)params.get("csrf");
		String formError = (String)params.get("formError");
		render(jteOutput, jteHtmlInterceptor, i18n, currentLanguage, csrf, formError);
	}
}
