const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html><div class="mt-3 text-[17px]">Hello</div>`);
const document = dom.window.document;
try {
  const el = document.querySelector(".mt-3.text-\\[17px\\]");
  console.log("Success:", el ? el.textContent : "not found");
} catch (e) {
  console.log("Error:", e.message);
}
