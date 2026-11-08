package gg.jte.generated.precompiled;
@SuppressWarnings("unchecked")
@javax.annotation.processing.Generated("gg.jte.TemplateEngine")
public final class JtelinkedaccountsGenerated {
	public static final String JTE_NAME = "linked-accounts.jte";
	public static final int[] JTE_LINE_INFO = {0,0,0,0,0,0,0,8,8,8,8,8,8,8,8,8,12,12,12,18,18,18,24,24,24,26,26,27,27,27,28,28,29,29,30,30,30,31,31,33,33,34,34,34,36,36,37,37,37,37,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,39,39,39,39,39,39,41,41,43,43,45,45,46,46,46,47,47,51,51,51,52,52,52,53,53,53,58,58,60,60,60,61,61,61,62,62,62,64,64,64,64,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,65,66,66,66,70,70,73,73,76,0,0,0,1,2,3,4,5,6,0,0,0};
	public static void render(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, String> i18n, String currentLanguage, java.util.List<kh.eco.istad.platform.authorization.domain.dto.identity.result.IdentityResult> identities, java.util.List<String> linkableProviders, org.springframework.security.web.csrf.CsrfToken csrf, String successKey, String errorKey) {
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
		jteOutput.writeUserContent(i18n.get("accounts.title"));
		jteOutput.writeContent("</title>\n    <link rel=\"stylesheet\" href=\"/iam.css\">\n</head>\n<body>\n<main class=\"card wide\">\n    <header>\n        <a href=\"/\">");
		jteOutput.setContext("a", null);
		jteOutput.writeUserContent(i18n.get("common.home"));
		jteOutput.writeContent("</a>\n        <nav>\n            <a href=\"?lang=en\">EN</a> · <a href=\"?lang=km\">ខ្មែរ</a>\n        </nav>\n    </header>\n\n    <h1>");
		jteOutput.setContext("h1", null);
		jteOutput.writeUserContent(i18n.get("accounts.title"));
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
		jteOutput.writeContent("\n\n    ");
		if (!linkableProviders.isEmpty()) {
			jteOutput.writeContent("\n        <h2>");
			jteOutput.setContext("h2", null);
			jteOutput.writeUserContent(i18n.get("accounts.link"));
			jteOutput.writeContent("</h2>\n        <div class=\"actions\">\n            ");
			for (var provider : linkableProviders) {
				jteOutput.writeContent("\n                <form method=\"post\" action=\"/profile/accounts/link/");
				jteOutput.setContext("form", "action");
				jteOutput.writeUserContent(provider);
				jteOutput.setContext("form", null);
				jteOutput.writeContent("\">\n                    <input type=\"hidden\"");
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
				jteOutput.writeContent(">\n                    <button>");
				jteOutput.setContext("button", null);
				jteOutput.writeUserContent(i18n.get("accounts.link"));
				jteOutput.writeContent(" ");
				jteOutput.setContext("button", null);
				jteOutput.writeUserContent(provider);
				jteOutput.writeContent("</button>\n                </form>\n            ");
			}
			jteOutput.writeContent("\n        </div>\n    ");
		}
		jteOutput.writeContent("\n\n    ");
		if (identities.isEmpty()) {
			jteOutput.writeContent("\n        <p>");
			jteOutput.setContext("p", null);
			jteOutput.writeUserContent(i18n.get("common.empty"));
			jteOutput.writeContent("</p>\n    ");
		} else {
			jteOutput.writeContent("\n        <table>\n            <thead>\n            <tr>\n                <th>");
			jteOutput.setContext("th", null);
			jteOutput.writeUserContent(i18n.get("accounts.provider"));
			jteOutput.writeContent("</th>\n                <th>");
			jteOutput.setContext("th", null);
			jteOutput.writeUserContent(i18n.get("accounts.email"));
			jteOutput.writeContent("</th>\n                <th>");
			jteOutput.setContext("th", null);
			jteOutput.writeUserContent(i18n.get("accounts.linkedAt"));
			jteOutput.writeContent("</th>\n                <th></th>\n            </tr>\n            </thead>\n            <tbody>\n            ");
			for (var identity : identities) {
				jteOutput.writeContent("\n                <tr>\n                    <td>");
				jteOutput.setContext("td", null);
				jteOutput.writeUserContent(identity.provider().name());
				jteOutput.writeContent("</td>\n                    <td>");
				jteOutput.setContext("td", null);
				jteOutput.writeUserContent(identity.email());
				jteOutput.writeContent("</td>\n                    <td>");
				jteOutput.setContext("td", null);
				jteOutput.writeUserContent(identity.linkedAt().toString());
				jteOutput.writeContent("</td>\n                    <td>\n                        <form method=\"post\" action=\"/profile/accounts/");
				jteOutput.setContext("form", "action");
				jteOutput.writeUserContent(identity.uuid().toString());
				jteOutput.setContext("form", null);
				jteOutput.writeContent("/unlink\">\n                            <input type=\"hidden\"");
				var __jte_html_attribute_3 = csrf.getParameterName();
				if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_3)) {
					jteOutput.writeContent(" name=\"");
					jteOutput.setContext("input", "name");
					jteOutput.writeUserContent(__jte_html_attribute_3);
					jteOutput.setContext("input", null);
					jteOutput.writeContent("\"");
				}
				var __jte_html_attribute_4 = csrf.getToken();
				if (gg.jte.runtime.TemplateUtils.isAttributeRendered(__jte_html_attribute_4)) {
					jteOutput.writeContent(" value=\"");
					jteOutput.setContext("input", "value");
					jteOutput.writeUserContent(__jte_html_attribute_4);
					jteOutput.setContext("input", null);
					jteOutput.writeContent("\"");
				}
				jteOutput.writeContent(">\n                            <button class=\"danger\">");
				jteOutput.setContext("button", null);
				jteOutput.writeUserContent(i18n.get("accounts.unlink"));
				jteOutput.writeContent("</button>\n                        </form>\n                    </td>\n                </tr>\n            ");
			}
			jteOutput.writeContent("\n            </tbody>\n        </table>\n    ");
		}
		jteOutput.writeContent("\n</main>\n</body>\n</html>");
	}
	public static void renderMap(gg.jte.html.HtmlTemplateOutput jteOutput, gg.jte.html.HtmlInterceptor jteHtmlInterceptor, java.util.Map<String, Object> params) {
		java.util.Map<String, String> i18n = (java.util.Map<String, String>)params.get("i18n");
		String currentLanguage = (String)params.get("currentLanguage");
		java.util.List<kh.eco.istad.platform.authorization.domain.dto.identity.result.IdentityResult> identities = (java.util.List<kh.eco.istad.platform.authorization.domain.dto.identity.result.IdentityResult>)params.get("identities");
		java.util.List<String> linkableProviders = (java.util.List<String>)params.get("linkableProviders");
		org.springframework.security.web.csrf.CsrfToken csrf = (org.springframework.security.web.csrf.CsrfToken)params.get("csrf");
		String successKey = (String)params.get("successKey");
		String errorKey = (String)params.get("errorKey");
		render(jteOutput, jteHtmlInterceptor, i18n, currentLanguage, identities, linkableProviders, csrf, successKey, errorKey);
	}
}
