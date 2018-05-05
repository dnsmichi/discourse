import toMarkdown from 'discourse/lib/to-markdown';

QUnit.module("lib:to-markdown");

QUnit.test("converts styles between normal words", assert => {
  const html = `Line with <s>styles</s> <b><i>between</i></b> words.`;
  const markdown = `Line with ~~styles~~ ***between*** words.`;
  assert.equal(toMarkdown(html), markdown);

  assert.equal(toMarkdown("A <b>bold </b>word"), "A **bold** word");
});

QUnit.test("converts inline nested styles", assert => {
  let html = `<em>Italicised line with <strong>some random</strong> <b>bold</b> words.</em>`;
  let markdown = `*Italicised line with **some random** **bold** words.*`;
  assert.equal(toMarkdown(html), markdown);

  html = `<i class="fa">Italicised line
   with <b title="strong">some<br>
   random</b> <s>bold</s> words.</i>`;
  markdown = `*Italicised line with **some\nrandom** ~~bold~~ words.*`;
  assert.equal(toMarkdown(html), markdown);
});

QUnit.test("converts a link", assert => {
  let html = `<a href="https://discourse.org">Discourse</a>`;
  let markdown = `[Discourse](https://discourse.org)`;
  assert.equal(toMarkdown(html), markdown);

  html = `<a href="https://discourse.org">Disc\n\n\nour\n\nse</a>`;
  markdown = `[Disc our se](https://discourse.org)`;
  assert.equal(toMarkdown(html), markdown);
});

QUnit.test("put raw URL instead of converting the link", assert => {
  let url = "https://discourse.org";
  const html = () => `<a href="${url}">${url}</a>`;

  assert.equal(toMarkdown(html()), url);

  url = "discourse.org/t/topic-slug/1";
  assert.equal(toMarkdown(html()), url);
});

QUnit.test("skip empty link", assert => {
  assert.equal(toMarkdown(`<a href="https://example.com"></a>`), "");
});

QUnit.test("converts heading tags", assert => {
  const html = `
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>

  \t  <h3>Heading 3</h3>


  <h4>Heading 4</h4>



<h5>Heading 5</h5>




<h6>Heading 6</h6>
  `;
  const markdown = `# Heading 1\n\n## Heading 2\n\n### Heading 3\n\n#### Heading 4\n\n##### Heading 5\n\n###### Heading 6`;
  assert.equal(toMarkdown(html), markdown);
});

QUnit.test("converts ul list tag", assert => {
  const html = `
  <ul>
    <li>Item 1</li>
    <li>
      Item 2
      <ul>
        <li>Sub Item 1</li>
        <li><p>Sub Item 2</p></li>
        <li>Sub Item 3<ul><li>Sub <i>Sub</i> Item 1</li><li>Sub <b>Sub</b> Item 2</li></ul></li>
      </ul>
    </li>
    <li>Item 3</li>
  </ul>
  `;
  const markdown = `* Item 1\n* Item 2\n  * Sub Item 1\n  * Sub Item 2\n\n  * Sub Item 3\n    * Sub *Sub* Item 1\n    * Sub **Sub** Item 2\n* Item 3`;
  assert.equal(toMarkdown(html), markdown);
});

QUnit.test("stripes unwanted inline tags", assert => {
  const html = `
  <p>Lorem ipsum <span>dolor sit amet, consectetur</span> <strike>elit.</strike></p>
  <p>Ut minim veniam, <label>quis nostrud</label> laboris <nisi> ut aliquip ex ea</nisi> commodo.</p>
  `;
  const markdown = `Lorem ipsum dolor sit amet, consectetur ~~elit.~~\n\nUt minim veniam, quis nostrud laboris ut aliquip ex ea commodo.`;
  assert.equal(toMarkdown(html), markdown);
});

QUnit.test("converts table tags", assert => {
  let html = `<address>Discourse Avenue</address><b>laboris</b>
  <table>
    <thead> <tr><th>Heading 1</th><th>Head 2</th></tr> </thead>
      <tbody>
        <tr><td>Lorem</td><td>ipsum</td></tr>
        <tr><td><b>dolor</b></td> <td><i>sit amet</i></td> </tr>

        </tbody>
</table>
  `;
  let markdown = `Discourse Avenue\n\n**laboris**\n\n|Heading 1|Head 2|\n| --- | --- |\n|Lorem|ipsum|\n|**dolor**|*sit amet*|`;
  assert.equal(toMarkdown(html), markdown);

  html = `<table>
            <tr><th>Heading 1</th><th>Head 2</th></tr>
            <tr><td><a href="http://example.com"><img src="http://example.com/image.png" alt="Lorem" width="45" height="45"></a></td><td>ipsum</td></tr>
          </table>`;
  markdown = `|Heading 1|Head 2|\n| --- | --- |\n|[![Lorem\\|45x45](http://example.com/image.png)](http://example.com)|ipsum|`;
  assert.equal(toMarkdown(html), markdown);
});

QUnit.test("replace pipes with spaces if table format not supported", assert => {
  let html = `<table>
    <thead> <tr><th>Headi<br><br>ng 1</th><th>Head 2</th></tr> </thead>
      <tbody>
        <tr><td>Lorem</td><td>ipsum</td></tr>
        <tr><td><a href="http://example.com"><img src="http://dolor.com/image.png" /></a></td> <td><i>sit amet</i></td></tr></tbody>
</table>
  `;
  let markdown = `Headi\n\nng 1 Head 2\nLorem ipsum\n[![](http://dolor.com/image.png)](http://example.com) *sit amet*`;
  assert.equal(toMarkdown(html), markdown);

  html = `<table>
    <thead> <tr><th>Heading 1</th></tr> </thead>
      <tbody>
        <tr><td>Lorem</td></tr>
        <tr><td><i>sit amet</i></td></tr></tbody>
</table>
  `;
  markdown = `Heading 1\nLorem\n*sit amet*`;
  assert.equal(toMarkdown(html), markdown);

  html = `<table><tr><td>Lorem</td><td><strong>sit amet</strong></td></tr></table>`;
  markdown = `Lorem **sit amet**`;
  assert.equal(toMarkdown(html), markdown);
});

QUnit.test("converts img tag", assert => {
  const url = "https://example.com/image.png";
  let html = `<img src="${url}" width="100" height="50">`;
  assert.equal(toMarkdown(html), `![|100x50](${url})`);

  html = `<div><span><img src="${url}" alt="description" width="50" height="100" /></span></div>`;
  assert.equal(toMarkdown(html), `![description|50x100](${url})`);

  html = `<a href="http://example.com"><img src="${url}" alt="description" /></a>`;
  assert.equal(toMarkdown(html), `[![description](${url})](http://example.com)`);

  html = `<a href="http://example.com">description <img src="${url}" /></a>`;
  assert.equal(toMarkdown(html), `[description ![](${url})](http://example.com)`);

  html = `<img alt="description" />`;
  assert.equal(toMarkdown(html), "");

  html = `<a><img src="${url}" alt="description" /></a>`;
  assert.equal(toMarkdown(html), `![description](${url})`);
});

QUnit.test("supporting html tags by keeping them", assert => {
  let html = "Lorem <del>ipsum dolor</del> sit <big>amet, <ins>consectetur</ins></big>";
  let output = html;
  assert.equal(toMarkdown(html), output);

  html = `Lorem <del style="font-weight: bold">ipsum dolor</del> sit <big>amet, <ins onclick="alert('hello')">consectetur</ins></big>`;
  assert.equal(toMarkdown(html), output);

  html = `<a href="http://example.com" onload="">Lorem <del style="font-weight: bold">ipsum dolor</del> sit</a>.`;
  output = `[Lorem <del>ipsum dolor</del> sit](http://example.com).`;
  assert.equal(toMarkdown(html), output);

  html = `Lorem <del>ipsum dolor</del> sit.`;
  assert.equal(toMarkdown(html), html);

  html = `Lorem <a href="http://example.com"><del>ipsum \n\n\n dolor</del> sit.</a>`;
  output = `Lorem [<del>ipsum dolor</del> sit.](http://example.com)`;
  assert.equal(toMarkdown(html), output);
});

QUnit.test("converts code tags", assert => {
  let html = `Lorem ipsum dolor sit amet,
  <pre><code>var helloWorld = () => {
  alert('    hello \t\t world    ');
    return;
}
helloWorld();</code></pre>
  consectetur.`;
  let output = `Lorem ipsum dolor sit amet,\n\n\`\`\`\nvar helloWorld = () => {\n  alert('    hello \t\t world    ');\n    return;\n}\nhelloWorld();\n\`\`\`\n\nconsectetur.`;

  assert.equal(toMarkdown(html), output);

  html = `Lorem ipsum dolor sit amet, <code>var helloWorld = () => {
  alert('    hello \t\t world    ');
    return;
}
helloWorld();</code>consectetur.`;
  output = `Lorem ipsum dolor sit amet, \`var helloWorld = () => {\n  alert('    hello \t\t world    ');\n    return;\n}\nhelloWorld();\` consectetur.`;

  assert.equal(toMarkdown(html), output);
});

QUnit.test("converts blockquote tag", assert => {
  let html = "<blockquote>Lorem ipsum</blockquote>";
  let output = "> Lorem ipsum";
  assert.equal(toMarkdown(html), output);

  html = "<blockquote>Lorem ipsum</blockquote><blockquote><p>dolor sit amet</p></blockquote>";
  output = "> Lorem ipsum\n\n> dolor sit amet";
  assert.equal(toMarkdown(html), output);

  html = "<blockquote>\nLorem ipsum\n<blockquote><p>dolor <blockquote>sit</blockquote> amet</p></blockquote></blockquote>";
  output = "> Lorem ipsum\n> > dolor\n> > > sit\n> >\n> >\n> > amet";
  assert.equal(toMarkdown(html), output);
});

QUnit.test("converts ol list tag", assert => {
  const html = `Testing
  <ol>
    <li>Item 1</li>
    <li>
      Item 2
      <ol start="100">
        <li>Sub Item 1</li>
        <li>Sub Item 2</li>
      </ol>
    </li>
    <li>Item 3</li>
  </ol>
  `;
  const markdown = `Testing\n\n1. Item 1\n2. Item 2\n  100. Sub Item 1\n  101. Sub Item 2\n3. Item 3`;
  assert.equal(toMarkdown(html), markdown);
});

QUnit.test("converts list tag from word", assert => {
  const html = `Sample<!--StartFragment-->
  <p class=MsoListParagraphCxSpFirst style='text-indent:-.25in;mso-list:l0 level1 lfo1'>
    <![if !supportLists]>
    <span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:  Symbol;mso-bidi-font-weight:bold'>
      <span style='mso-list:Ignore'>·
        <span style='font:7.0pt "Times New Roman"'> </span>
      </span>
    </span>
    <![endif]>
    <b>Item 1
      <o:p></o:p>
    </b>
  </p>
  <p class=MsoListParagraphCxSpMiddle style='text-indent:-.25in;mso-list:l0 level2 lfo1'>
    <![if !supportLists]>
    <span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:  Symbol;mso-bidi-font-style:italic'>
      <span style='mso-list:Ignore'>·
        <span style='font:7.0pt "Times New Roman"'> </span>
      </span>
    </span>
    <![endif]>
    <i>Item 2
      <o:p></o:p>
    </i>
  </p>
  <p class=MsoListParagraphCxSpMiddle style='text-indent:-.25in;mso-list:l0 level3 lfo1'>
    <![if !supportLists]>
    <span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:  Symbol'>
      <span style='mso-list:Ignore'>·
        <span style='font:7.0pt "Times New Roman"'> </span>
      </span>
    </span>
    <![endif]>Item 3 </p>
  <p class=MsoListParagraphCxSpLast style='text-indent:-.25in;mso-list:l0 level1 lfo1'>
    <![if !supportLists]>
    <span style='font-family:Symbol;mso-fareast-font-family:Symbol;mso-bidi-font-family:  Symbol'>
      <span style='mso-list:Ignore'>·
        <span style='font:7.0pt "Times New Roman"'> </span>
      </span>
    </span>
    <![endif]>Item 4</p>
  <!--EndFragment-->List`;
  const markdown = `Sample\n\n* **Item 1**\n  * *Item 2*\n    * Item 3\n* Item 4\n\nList`;
  assert.equal(toMarkdown(html), markdown);
});

QUnit.test("remove whitespaces", assert => {
  assert.equal(toMarkdown(`
    <div dir="auto">Hello,
      <div dir="auto"><br></div>
      <div dir="auto">&nbsp; &nbsp; This is the 1st paragraph.&nbsp; &nbsp; </div>
      <div dir="auto"><br></div>
      <div dir="auto">
        &nbsp; &nbsp; &nbsp; &nbsp; This is another paragraph
      </div>
    </div>
  `), "Hello,\n\nThis is the 1st paragraph.\n\nThis is another paragraph");
});

QUnit.test("skips hidden tags", assert => {
  assert.equal(toMarkdown(`<p>Hello <span style="display: none">cruel </span>World!</p>`), "Hello World!");
});

QUnit.test("skips hidden <img>", assert => {
  assert.equal(toMarkdown(`<img src="https://www.discourse.org/logo.svg" width=0>`), "");
  assert.equal(toMarkdown(`<img src="https://www.discourse.org/logo.svg" height="0">`), "");
  assert.equal(toMarkdown(`<img src="https://www.discourse.org/logo.svg" style="width: 0">`), "");
  assert.equal(toMarkdown(`<img src="https://www.discourse.org/logo.svg" style="height:0px">`), "");
});

QUnit.test("converts <code>", assert => {
  assert.equal(toMarkdown("<code>Code</code>"), "`Code`");
});

QUnit.test("supports <ins>", assert => {
  assert.equal(toMarkdown("This is an <ins>insertion</ins>"), "This is an <ins>insertion</ins>");
});

QUnit.test("supports <del>", assert => {
  assert.equal(toMarkdown("This is a <del>deletion</del>"), "This is a <del>deletion</del>");
});

QUnit.test("supports <sub>", assert => {
  assert.equal(toMarkdown("H<sub>2</sub>O"), "H<sub>2</sub>O");
});

QUnit.test("supports <sup>", assert => {
  assert.equal(toMarkdown("<sup>Super Script!</sup>"), "<sup>Super Script!</sup>");
});

QUnit.test("supports <small>", assert => {
  assert.equal(toMarkdown("<small>Small</small>"), "<small>Small</small>");
});

QUnit.test("supports <kbd>", assert => {
  assert.equal(toMarkdown("<kbd>CTRL</kbd>+<kbd>C</kbd>"), "<kbd>CTRL</kbd>+<kbd>C</kbd>");
});

QUnit.test("supports <abbr>", assert => {
  assert.equal(toMarkdown(`<abbr title="Civilized Discourse Construction Kit, Inc.">CDCK</abbr>`), `<abbr title="Civilized Discourse Construction Kit, Inc.">CDCK</abbr>`);
});

QUnit.test("supports <blockquote>", assert => {
  assert.equal(toMarkdown("<blockquote>Quote</blockquote>"), "> Quote");
});

QUnit.test("supports <p> inside <li>", assert => {
  assert.equal(toMarkdown("<ul><li><p>🍏</p></li><li><p>🍐</p></li><li><p>🍌</p></li></ul>"), "* 🍏\n\n* 🍐\n\n* 🍌");
});

QUnit.test("supports <ul> inside <ul>", assert => {
  assert.equal(toMarkdown(`
      <ul>
        <li>Fruits
            <ul>
                <li>🍏</li>
                <li>🍐</li>
                <li>🍌</li>
            </ul>
        </li>
        <li>Vegetables
            <ul>
                <li>🍆</li>
                <li>🍅</li>
                <li>🍄</li>
            </ul>
        </li>
      </ul>
    `), "* Fruits\n  * 🍏\n  * 🍐\n  * 🍌\n* Vegetables\n  * 🍆\n  * 🍅\n  * 🍄");
});

QUnit.test("supports bare <li>", assert => {
  assert.equal(toMarkdown("<li>I'm alone</li>"), "* I'm alone");
});

QUnit.test("supports <pre>", assert => {
  assert.equal(toMarkdown("<pre>var foo = 'bar';</pre>"), "```\nvar foo = 'bar';\n```");
  assert.equal(toMarkdown("<pre><code>var foo = 'bar';</code></pre>"), "```\nvar foo = 'bar';\n```");
  assert.equal(toMarkdown(`<pre><code class="lang-javascript">var foo = 'bar';</code></pre>`), "```javascript\nvar foo = 'bar';\n```");
});

QUnit.test("supports <pre> inside <blockquote>", assert => {
  assert.equal(toMarkdown("<blockquote><pre><code>var foo = 'bar';</code></pre></blockquote>"), "> ```\n> var foo = 'bar';\n> ```");
});

QUnit.test("works", assert => {
  assert.equal(
    toMarkdown("<ul><li><p>A list item with a blockquote:</p><blockquote><p>This is a <strong>blockquote</strong><br>inside a list item.</p></blockquote></li></ul>"),
    "- A list item with a blockquote:\n\n  > This is a **blockquote**\n  > inside a list item."
  );
});

QUnit.test("supports html document", assert => {
  assert.equal(toMarkdown("<html><body>Hello<div>World</div></body></html>"), "Hello\n\nWorld");
});

QUnit.test("removes <script>", assert => {
  assert.equal(toMarkdown("<script>var foo = 'bar'</script>"), "");
});

QUnit.test("removes <style>", assert => {
  assert.equal(toMarkdown("<style>* { margin: 0 }</style>"), "");
});

QUnit.test("handles divs within spans", assert => {
  assert.equal(toMarkdown("<div>1st paragraph<span><div>2nd paragraph</div></span></div>"), "1st paragraph\n\n2nd paragraph");
});

QUnit.test("handles <strong> with an oddly placed <br>", assert => {
  assert.equal(toMarkdown("<strong><br>Bold</strong>"), "**Bold**");
  assert.equal(toMarkdown("<strong>Bold<br></strong>"), "**Bold**");
  assert.equal(toMarkdown("<strong>Bold<br>text</strong>"), "**Bold\ntext**");
});

QUnit.test("handles <em> with an oddly placed <br>", assert => {
  assert.equal(toMarkdown("<em><br>Italic</em>"), "*Italic*");
  assert.equal(toMarkdown("<em>Italic<br></em>"), "*Italic*");
  assert.equal(toMarkdown("<em>Italic<br>text</em>"), "*Italic\ntext*");
});

QUnit.test("handles <strong> with an empty tag", assert => {
  assert.equal(toMarkdown("<strong></strong>"), "");
  assert.equal(toMarkdown("<strong>   </strong>"), "");
  assert.equal(toMarkdown("Some<strong> </strong>text"), "Some text");
  assert.equal(toMarkdown("Some<strong>    </strong>text"), "Some text");
});

QUnit.test("handles <em> with an empty tag", assert => {
  assert.equal(toMarkdown("<em></em>"), "");
  assert.equal(toMarkdown("<em>   </em>"), "");
  assert.equal(toMarkdown("Some<em> </em>text"), "Some text");
  assert.equal(toMarkdown("Some<em>    </em>text"), "Some text");
});

QUnit.test("handles <strong> with spaces around text", assert => {
  assert.equal(toMarkdown("<strong> Bold</strong>"), "**Bold**");
  assert.equal(toMarkdown("<strong>     Bold</strong>"), "**Bold**");
  assert.equal(toMarkdown("<strong>Bold </strong>"), "**Bold**");
  assert.equal(toMarkdown("<strong>Bold     </strong>"), "**Bold**");
  assert.equal(toMarkdown("Some<strong> bold</strong> text"), "Some **bold** text");
  assert.equal(toMarkdown("Some<strong>     bold</strong> text"), "Some **bold** text");
  assert.equal(toMarkdown("Some <strong>bold </strong>text"), "Some **bold** text");
  assert.equal(toMarkdown("Some <strong>bold     </strong>text"), "Some **bold** text");
});

QUnit.test("handles <em> with spaces around text", assert => {
  assert.equal(toMarkdown("<em> Italic</em>"), "*Italic*");
  assert.equal(toMarkdown("<em>     Italic</em>"), "*Italic*");
  assert.equal(toMarkdown("<em>Italic </em>"), "*Italic*");
  assert.equal(toMarkdown("<em>Italic     </em>"), "*Italic*");
  assert.equal(toMarkdown("Some<em> italic</em> text"), "Some *italic* text");
  assert.equal(toMarkdown("Some<em>     italic</em> text"), "Some *italic* text");
  assert.equal(toMarkdown("Some <em>italic </em>text"), "Some *italic* text");
  assert.equal(toMarkdown("Some <em>italic     </em>text"), "Some *italic* text");
});
