opyright & License:
 * ZetaBoards WYSIWYG Text Editor by Andrew Lee
 * http://andrewleenj.com
 * Released under the M.I.T license.
 * Please leave this copyright intact.
 * 
 * About:
 * This script was originally created for personal use but I decided to release it
 * to the public so that everybody could benefit. After all, what's the use of keeping such a
 * wonderful script to yourself? This script is highly customizeable, create your own buttons,
 * choose which buttons to show their full text, ie: "Bold" instead of "B". You can choose which
 * fonts you want to let your users choose from, colors, and even highlighting. Of course you can
 * always stick with the provided default settings.
 * 
 * Usage:
 * Simply insert this script into Board Template -> Below The Board. After that put the following:
 * <script>
 * wysiwyg.init();
 * </script>
 * That's it if you're satisfied with the default settings.
 * 
 * Customizing:
 * Please read the post/page where you found this script.
 * 
 * In The Works:
 * More BBCodes
 * Automatic Editor Styling
 * Fast Reply Integration
 * Edit Integration
 * 
 * Changelog:
 * 1.0.0 - Initial Private Release
 * 1.0.1 - Added regular expressions for the highlight bbcode.
 * 1.0.2 - Added regular expression for the left button. Added the left button.
 * 1.1.0 - Added the fullTitle object which contains buttons that will display their 
 * 		   full text and not just the first letter.
 * 1.2.0 - Added regular expressions to parse post boxes.
 * 1.2.1 - Attempted automatic styling. Edit integration complete. First BETA release.
 */

(function () {
	//Version Check
	window.WYSIWYG_V = '1.2.1';

	var wysiwyg = {
		//Default settings.
		factory: {
			font: {
				bold: true,
				italic: true,
				underline: true,
				strike: true
			},

			alignment: {
				left: true,
				center: true,
				right: true
			},

			link: true,
			image: true,
			hr: true,
			list: true,

			families: [
				['Arial', 'arial'],
				['Sans Serif', 'sans-serif'],
				['Tahoma', 'tahoma']
			],

			color: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'],

			highlight: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple']
		},

		fullTitle: {
			list: true,
			link: true,
			hr: true,
			image: true
		},

		//Lets copy jQuery :)
		props: {
			left: 'justifyLeft',
			center: 'justifycenter',
			right: 'justifyright',
			list: 'insertunorderedlist',
			families: 'fontname',
			color: 'ForeColor',
			bigger: 'fontsize',
			smaller: 'fontsize',
			strike: 'strikethrough',
			highlight: 'hilitecolor',
			image: 'insertimage',
			link: 'createLink',
			hr: 'inserthorizontalrule'
		},

		//For any BBCodes that require prompts.
		prompts: {
			link: 'Please enter a URL:',
			image: 'Please enter an image URL:'
		},

		//Regexps to parse the iframe.
		regexps: [
			[/<meta .+?>/gi, ''],
			[/<div style="text-align: left;">(.+?)<\/div>/gi, '$1\r'],
			[/<div style="text-align: (.+?);">(.+?)<\/div>/gi, '[$1]$2[/$1]\r'],
			[/<img\s[^<>]*?src=\"?([^<>]*?)\"?(\s[^<>]*)?\/?>/gi, '[img]$1[/img]'],
			[/<div.+?>(.+?)<\/div>/gi, '\r$1'],
			[/<br>/gi, '\n'],
			[/<a href="(.+?)">(.+?)<\/a>/gi, '[url=$1]$2[/url]'],
			[/<font face="([^>]+?)" style="background-color: ([^>]+?);" color="([^>]+?)">(.+?)<\/font>/gi, '[bgcolor=$2][font=$1][color=$3]$4[/color][/font][/bgcolor]'],
			[/<font color="([^>]+?)" style="background-color: ([^>]+?);" face="([^>]+?)">(.+?)<\/font>/gi, '[bgcolor=$2][font=$3][color=$1]$4[/color][/font][/bgcolor]'],
			[/<font face="([^>]+?)" color="([^>]+?)" style="background-color: ([^>]+?);">(.+?)<\/font>/gi, '[bgcolor=$3][font=$1][color=$2]$4[/color][/font][/bgcolor]'],
			[/<font face="([^>]+?)">(.+)<\/font>/gi, '[font=$1]$2[/font]'],
			[/<font color="(.+?)" style="color:.+?">(.+)<\/font>/gi, '[font=$1]$2[/font]'],
			[/<font color="([^>]+?)">(.+)<\/font>/gi, '[color=$1]$2[/color]'],
			[/<font style="background-color: ([^>]+?);">(.+?)<\/font>/gi, '[bgcolor=$1]$2[/bgcolor]'],
			[/<font color="([^>]+?)" face="([^>]+?)">(.+?)<\/font>/gi, '[color=$1][font=$2]$3[/font][/color]'],
			[/<font face="([^>]+?)" style="background-color: ([^>]+?);">(.+?)<\/font>/gi, '[bgcolor=$2][font=$1]$3[/font][/bgcolor]'],
			[/<font color="([^">]+?)" style="background-color: ([^;>]+?);">(.+?)<\/font>/gi, '[bgcolor=$2][color=$1]$2[/color][/bgcolor]'],
			[/<font class="hm" face="([^>]+?)" color="([^>]+?)">(.+?)<\/font>/gi, '[font=$1][color=$2]$4[/color][/font]'],
			[/<font class="hm" face="([^>]+?)" style="background-color: ([^>]+?);" color="([^>]+?)">(.+?)<\/font>/gi, '[bgcolor=$2][font=$1][color=$3]$4[/color][/font][/bgcolor]'],
			[/<font class="hm" color="([^>]+?)" style="background-color: ([^>]+?);" face="([^>]+?)">(.+?)<\/font>/gi, '[bgcolor=$2][font=$3][color=$1]$4[/color][/font][/bgcolor]'],
			[/<font class="hm" face="([^>]+?)" color="([^>]+?)" style="background-color: ([^>]+?);">(.+?)<\/font>/gi, '[bgcolor=$3][font=$1][color=$2]$4[/color][/font][/bgcolor]'],
			[/<font class="hm" face="([^>]+?)">(.+?)<\/font>/gi, '[font=$1]$2[/font]'],
			[/<font class="hm" color="([^>]+?)">(.+?)<\/font>/gi, '[color=$1]$2[/color]'],
			[/<font class="hm" style="background-color: ([^>]+?);">(.+?)<\/font>/gi, '[bgcolor=$1]$2[/bgcolor]'],
			[/<font class="hm" color="([^>]+?)" face="([^>]+?)">(.+?)<\/font>/gi, '[color=$1][font=$2]$3[/font][/color]'],
			[/<font class="hm" face="([^>]+?)" style="background-color: ([^>]+?);">(.+?)<\/font>/gi, '[bgcolor=$2][font=$1]$3[/font][/bgcolor]'],
			[/<font class="hm" color="([^">]+?)" style="background-color: ([^;>]+?);">(.+?)<\/font>/gi, '[bgcolor=$2][color=$1]$2[/color][/bgcolor]'],
			[/<font class="hm" face="([^>]+?)" color="([^>]+?)">(.+?)<\/font>/gi, '[font=$1][color=$2]$4[/color][/font]'],
			[/<span face="([^>]+?)">(.+?)<\/span>/gi, '[font=$1]$2[/font]'],
			[/<span color="([^>]+?)">(.+?)<\/span>/gi, '[color=$1]$2[/color]'],
			[/<span style="background-color: ([^>]+?);">(.+?)<\/span>/gi, '[bgcolor=$1]$2[/bgcolor]'],
			[/<span color="([^>]+?)" face="([^>]+?)" >(.+?)<\/span>/gi, '[color=$1][font=$2]$3[/font][/color]'],
			[/<span face="([^>]+?)" style="background-color: ([^>]+?);">(.+?)<\/span>/gi, '[bgcolor=$2][font=$1]$3[/font][/bgcolor]'],
			[/<span color="([^>]+?)" style="background-color: ([^>]+?);">(.+?)<\/span>/gi, '[bgcolor=$2][color=$1]$2[/color][/bgcolor]'],
			[/<(\/?)font>/gi, ''],
			[/<li style="text-align: left;">(.+?)<\/li>/, '\r[*]$1'],
			[/<li style="text-align: (.+?);">(.+?)<\/li>/, '\r[*][$1]$2[/$1]'],
			[/<\/li>/gi, ''],
			[/<li>/gi, '\r[*]'],
			[/<(\/?)ul>/gi, '\r[$1list]\r'],
			[/<(\/?)strike>/gi, '[$1s]'],
			[/<hr.+?>/gi, '[hr]'],
			[/<(\/?)(\w+?)>/gi, '[$1$2]']
		],

		//Regexps to parse post boxes.
		bbcodes: [
			[/\[(\/)?s\]/gi, '<$1strike>'],
			[/\[center\](.+?)\[\/center\]/gi, '<div style="text-align: center;">$1</div>'],
			[/\[right\](.+?)\[\/right\]/gi, '<div style="text-align: right;">$1</div>'],
			[/\[img\](.+?)\[\/img\]/gi, '<img src="$1" />'],
			[/\[url=(.+?)\](.+?)\[\/url\]/gi, '<a href="$1">$2</a>'],
			[/\[url\](.+?)\[\/url\]/gi, '<a href="$1">$1</a>'],
			[/\[font=(.+?)\](.+?)\[\/font\]/gi, '<font face="$1">$2</font>'],
			[/\[color=(.+?)\](.+?)\[\/color\]/gi, '<font color="$1">$2</font>'],
			[/\[bgcolor=(.+?)\](.+?)\[\/bgcolor\]/gi, '<span style="background-color: $1">$2</span>'],
			[/\[(\/?)list\]/gi, '<$1ul>'],
			[/\[\*\](.+?)\r/gi, '<li>$1</li>\r'],
			[/\[(\/)?(\w+?)\]/gi, '<$1$2>'],
			[/\r/gi, '<br />']
		],

		css: [
			'font-family',
			'font-size',
			'color',
			'background',
			'letter-spacing',
			'line-height',
			'overflow',
			'padding',
			'vertical-align'
		],

		//BBCode Box
		bbcBox: '',

		//Recursion for later :)
		traverse: function (obj) {
			for (var n in obj) {
				//More objects to traverse
				//Make sure arrays aren't mistaken for additional setting groups.
				if (typeof obj[n] === 'object' && obj[n].constructor !== [].constructor) {
					wysiwyg.traverse(obj[n]);
				}
				//Fonts
				else if (obj[n].constructor === [].constructor) {
					var title = n === 'families' ? 'Font' : n === 'color' ? 'Color' : 'Highlight';
					var fonts = '<select title="' + n.toLowerCase() + '"><option>' + title + '</option>';

					for (var k = 0; k < obj[n].length; k++) {
						var value = obj[n][k].constructor === [].constructor ? obj[n][k][1] : obj[n][k];
						var text = obj[n][k].constructor === [].constructor ? obj[n][k][0] : obj[n][k];

						fonts += '<option value="' + value + '">' + text + '</option>';
					}

					fonts += '</select> ';
					$(wysiwyg.bbcBox).append(fonts + ' ');
				}
				//Everything else.
				else if (typeof obj[n] === 'boolean') {
					if (obj[n]) {
						//Some more ternary action.
						var txt = obj === wysiwyg.factory.alignment || wysiwyg.fullTitle[n] ? n[0].toUpperCase() + n.slice(1, n.length) : n[0].toUpperCase();
						var title = n[0].toUpperCase() + n.slice(1, n.length);
						$(wysiwyg.bbcBox).append('<button title="' + title + '">' + txt + '</button> ');
					}
				}
			}
		},

		init: function (settings, style) {
			if($.browser.webkit){
				//Some variables for later.
				var that = settings;
				var factory = wysiwyg.factory;

				//Self invoking annonymous function o harro.
				settings = (function () {
					//If any settings were defined fill in any undefined settings with defaults.
					if (typeof that === 'object' && that.constructor !== [].constructor) {
						for (var n in factory) {
							if (!settings.hasOwnProperty(n)) {
								that[n] = factory[n];
							}
						}

						return that;
					}
					//Otherwise just return the default settings.
					else {
						return factory;
					}
				})();

				//Check the URL to see whether or not to run. Also check for the post box.
				if(location.href.match(/\/post\//) && $('form[name=posting] textarea[name=post]').length){
					//Hide the post box and insert an iframe.
					$('textarea[name=post]').hide().after('<iframe id="wysiwyg" /></div>');
					wysiwyg.bbcBox = $('#c_bbcode').empty();

					//Use the node itself instead of a nodelist.
					var ifr = $('#wysiwyg')[0];

					//Turnary action here to enable design mode.
					var sub = ifr.designMode ? '' : ifr.contentDocument ? 'contentDocument' : ifr.contentWindow.document ? 'contentWindow.document' : 'document';

					//Style the editor to look like a textarea.
					ifr.style.cssText = document.defaultView.getComputedStyle($('textarea[name=post]')[0], '').cssText;

					$(ifr).show();

					if(typeof style !== 'object' || style.constructor !== [].constructor || (typeof that === 'object' && that.constructor === [].constructor)){
						style = wysiwyg.css;
					}

					for(var n = 0; n < style.length; n++){
						ifr[sub].getElementsByTagName('body')[0].style.setProperty(style[n], document.defaultView.getComputedStyle($('textarea[name=post]')[0], '').getPropertyValue(style[n]));
					}

					//Turn on design mode.
					ifr[sub].designMode = 'on';
					ifr[sub].contentEditable = 'true';

					//Fill the iframe with any content inside the post box.
					wysiwyg.parseEdit($('textarea[name=post]').val());

					//Lets bring some recursion into this for some fun :D
					wysiwyg.traverse(settings);

					//Please don't resubmit the form when I click a button. Thanks :)
					$(wysiwyg.bbcBox).find('button') /*Find is faster than using a child selector*/
					.click(function (e) {
						//Stop the form from submitting >.>
						e.preventDefault();

						//Choose the correct command and execute it. Another annonymous function for the lelz.
						that = this;

						ifr[sub].execCommand((function () {
							var comm = $(that).attr('title').toLowerCase();
							comm = wysiwyg.props[comm] ? wysiwyg.props[comm] : comm;

							return comm;
						})(), false, (function () {
							var aval = '',
								toprompt = wysiwyg.prompts[$(that).attr('title').toLowerCase()];

							if (toprompt) {
								aval = prompt(toprompt);
							}

							return aval;
						})());

						//Refocus the iframe.
						ifr.focus();
						wysiwyg.update();

						//Fallback
						return false;
					});

					//Fonts and colors and any extra stuff.
					$(wysiwyg.bbcBox).find('select').change(function () {
						var that = this;

						if ($(that).val() !== $(that).find('option:first').val()) {
							ifr[sub].execCommand((function () {
								var comm = $(that).attr('title').toLowerCase();
								comm = wysiwyg.props[comm] ? wysiwyg.props[comm] : comm;

								return comm;
							})(), false, $(that).val());
						}

						//Refocus the iframe.
						ifr.focus();
						wysiwyg.update();
					});

					//When it's time to post.
					$('form[name=posting]').submit(function () {
						wysiwyg.update();
					});

					//In case we're editing.
					wysiwyg.parseEdit($('textarea[name=post]').val());
				}
			}
		},

		//What makes this entire thing work :D
		update: function () {
			//Node instead of nodelist please.
			var ifr = $('#wysiwyg')[0];

			//Same ternary action as before.
			var sub = ifr.designMode ? '' : ifr.contentDocument ? 'contentDocument' : ifr.contentWindow.document ? 'contentWindow.document' : 'document';

			var html = ifr[sub].getElementsByTagName('body')[0].innerHTML;

			for (var n = 0; n < wysiwyg.regexps.length; n++){
				while(html.match(new RegExp(wysiwyg.regexps[n][0]))){
					html = html.replace(new RegExp(wysiwyg.regexps[n][0]), wysiwyg.regexps[n][1]);
				}
				
				console.log(html);
				console.log(wysiwyg.regexps[n][0]);
			}

			$('textarea[name=post]').val(html);
		},

		parseEdit: function (value) {
			//Node instead of nodelist please.
			var ifr = $('#wysiwyg')[0];

			//Same ternary action as before.
			var sub = ifr.designMode ? '' : ifr.contentDocument ? 'contentDocument' : ifr.contentWindow.document ? 'contentWindow.document' : 'document';

			for (var n = 0; n < wysiwyg.bbcodes.length; n++) {
				value = value.replace(new RegExp(wysiwyg.bbcodes[n][0]), wysiwyg.bbcodes[n][1]);
			}

			ifr[sub].getElementsByTagName('body')[0].innerHTML = value;
		}
	};

	wysiwyg.init();
})();
