export default function script_loader(framework) {
  return {
    name: 'html-transform',
    enforce: "pre",
    transformIndexHtml(html) {
      html = html.replace(/\<script type="module" src=""\>/, `<script type="module" src="${framework}">`);
      return html
    }
  }
}