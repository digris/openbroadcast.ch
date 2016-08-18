(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["achat/nj/message.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"item message new";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"user")),"is_me")) {
output += " me";
;
}
output += " ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"attachments")) {
output += " has-attachments";
;
}
output += " ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"extra_classes")) {
output += " ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"extra_classes"), env.opts.autoescape);
;
}
output += "\">\n\n    <div class=\"bubble\">\n        <div class=\"body\"\n            ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"user")),"is_me")) {
output += "data-livebg";
;
}
output += "\n            >\n\n            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"attachments")) {
output += "\n                ";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"attachments");
if(t_3) {var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("attachment", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n                    ";
output += runtime.suppressValue(t_4, env.opts.autoescape);
output += "\n                ";
;
}
}
frame = frame.pop();
output += "\n\n            ";
;
}
output += "\n\n\n            ";
if(env.getFilter("length").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"text")) > 240) {
output += "\n                <p class=\"truncated\"";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"user")),"is_me")) {
output += " data-livefg";
;
}
output += ">\n                    ";
output += runtime.suppressValue(env.getFilter("urlize").call(context, env.getFilter("truncate").call(context, env.getFilter("linebreaksbr").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"text")),240,runtime.contextOrFrameLookup(context, frame, "True"),"<a class=\"show-full-text\" href=\"#\">&nbsp;&gt;&gt;&gt;</a>")), env.opts.autoescape);
output += "\n                </p>\n                <p class=\"full hide\"";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"user")),"is_me")) {
output += " data-livefg";
;
}
output += ">\n                    ";
output += runtime.suppressValue(env.getFilter("urlize").call(context, env.getFilter("linebreaksbr").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"text"))), env.opts.autoescape);
output += "\n                    <a class=\"show-full-text\" href=\"#\">&nbsp;&lt;&lt;&lt;</a>\n                </p>\n            ";
;
}
else {
output += "\n                <p";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"user")),"is_me")) {
output += " data-livefg";
;
}
output += ">\n                    ";
output += runtime.suppressValue(env.getFilter("urlize").call(context, env.getFilter("linebreaksbr").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"text"))), env.opts.autoescape);
output += "\n                </p>\n            ";
;
}
output += "\n        </div>\n\n        <div class=\"triangle\">\n\n            <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n                 x=\"0px\" y=\"0px\"\n                 viewBox=\"0 0 10 5\"\n                 enable-background=\"new 0 0 10 5\"\n                 xml:space=\"preserve\"\n                 preserveAspectRatio=\"none\"\n                 ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"user")),"is_me")) {
output += "data-livefill";
;
}
output += ">\n                <polygon points=\"0,0 5,5 10,0 \"/>\n            </svg>\n\n        </div>\n    </div>\n\n\n    <div class=\"author text-center\">\n        <span class=\"user\">\n            ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"user")),"is_me")) {
output += "\n            << me >>\n            ";
;
}
else {
output += "\n                <a  data-profile_uri=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"user")),"profile_uri"), env.opts.autoescape);
output += "\" href=\"#\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"user")),"display_name"), env.opts.autoescape);
output += "</a>\n            ";
;
}
output += "\n        </span>\n        <span class=\"separator\">|</span>\n        <span class=\"timestamp\" title=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "message")),"created"), env.opts.autoescape);
output += "\"></span>\n    </div>\n\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["achat/nj/profile.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "\n\n<div class=\"row profile\">\n\n    <div class=\"small-";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"image")) {
output += "9";
;
}
else {
output += "12";
;
}
output += " columns\">\n        <ul class=\"no-bullet\">\n            <li class=\"name\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"full_name"), env.opts.autoescape);
output += "</li>\n            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"pseudonym")) {
output += "\n                <li class=\"name pseudonym\">a.k.a. \"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"pseudonym"), env.opts.autoescape);
output += "\"</li>\n            ";
;
}
output += "\n            <li class=\"location\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"city"), env.opts.autoescape);
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"city") && runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"country")) {
output += ", ";
;
}
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"country"), env.opts.autoescape);
output += "</li>\n\n\n        </ul>\n    </div>\n\n    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"image")) {
output += "\n        <div class=\"small-3 columns image\">\n            <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"image"), env.opts.autoescape);
output += "\">\n        </div>\n    ";
;
}
output += "\n\n    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"groups")) {
output += "\n    <div class=\"row roles text-center\">\n        <div class=\"small-12 columns\">\n            ";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"groups");
if(t_3) {var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("group", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n            <span class=\"role\">";
output += runtime.suppressValue(t_4, env.opts.autoescape);
output += "</span>\n            ";
;
}
}
frame = frame.pop();
output += "\n        </div>\n    </div>\n    ";
;
}
output += "\n\n</div>\n\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["bplayer/nj/__orig__playlist.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "\n\n";
if(!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "opts")),"expanded")) {
output += "\n\n    <section class=\"playlist history compact\">\n\n        ";
if(!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "opts")),"onair") && runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "opts")),"mode") != "history") {
output += "\n\n            <div class=\"item playing\">\n                <span>Unbekannter Titel - \"Emergency Player\"</span>\n            </div>\n\n        ";
;
}
else {
output += "\n\n            ";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "objects");
if(t_3) {var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("item", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n                ";
output += "\n                <div class=\"item";
if(runtime.memberLookup((t_4),"onair")) {
output += " onair";
;
}
output += "\"\n                    data-uuid=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_4),"item")),"uuid"), env.opts.autoescape);
output += "\">\n\n                    <a href=\"#\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_4),"item")),"name"), env.opts.autoescape);
output += "</a>\n                    <br class=\"show-for-small-only\">\n                    <span>by</span>\n                    <a href=\"#\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_4),"item")),"artist")),"name"), env.opts.autoescape);
output += "</a>\n\n                </div>\n                ";
output += "\n            ";
;
}
}
frame = frame.pop();
output += "\n\n        ";
;
}
output += "\n\n    </section>\n\n";
;
}
else {
output += "\n\n    <section class=\"playlist history expanded\">\n\n\n        <!-- TODO: find another way for template switching -->\n        <!-- condensed/mobile display -->\n        <div class=\"show-for-small-only\">\n\n            ";
frame = frame.push();
var t_7 = runtime.contextOrFrameLookup(context, frame, "objects");
if(t_7) {var t_6 = t_7.length;
for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("item", t_8);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n            <div class=\"row item hoverable";
if(runtime.memberLookup((t_8),"onair")) {
output += " onair";
;
}
output += "\">\n\n                <div class=\"small-2 col-action columns\">\n                    ";
if(runtime.memberLookup((t_8),"onair")) {
output += "\n                        <a href=\"#\"><i class=\"fa fa-pause\"></i></a>\n                    ";
;
}
else {
output += "\n                        <a data-login-required href=\"#\"><i class=\"fa fa-play\"></i></a>\n                    ";
;
}
output += "\n                </div>\n\n                <div class=\"small-2 col-airtime columns\">\n                    ";
if(runtime.memberLookup((t_8),"onair")) {
output += "\n                    <span>On Air</span>\n                    ";
;
}
else {
output += "\n                        ";
if(runtime.memberLookup((t_8),"time_start")) {
output += "\n                        ";
output += runtime.suppressValue(env.getFilter("datetime2hhmm").call(context, runtime.memberLookup((t_8),"time_start")), env.opts.autoescape);
output += "\n                        ";
;
}
output += "\n                    ";
;
}
output += "\n                    &nbsp;\n                </div>\n\n                <div class=\"small-8 col-name columns\">\n                    <p>\n                        ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_8),"item")),"name"), env.opts.autoescape);
output += "\n                        <br>\n                        by: ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_8),"item")),"artist")),"name"), env.opts.autoescape);
output += "\n                    </p>\n                </div>\n\n\n            </div>\n            ";
;
}
}
frame = frame.pop();
output += "\n\n        </div>\n\n\n\n\n\n        <!-- expanded/table style display -->\n        <div class=\"show-for-medium-up\">\n\n            <div class=\"row header\">\n                <div class=\"col-airtime columns\">\n                    Airtime\n                </div>\n                <div class=\"col-action columns\">\n                    &nbsp;\n                </div>\n                <div class=\"col-name columns\">\n                    Title\n                </div>\n                <div class=\"col-artist columns\">\n                    Artist\n                </div>\n                <!-- price & buy are not available yet - just here for the future\n                <div class=\"col-price columns\">\n                    Price\n                </div>\n                <div class=\"col-buy columns end\">\n                    &nbsp;\n                </div>\n                -->\n            </div>\n\n            ";
frame = frame.push();
var t_11 = runtime.contextOrFrameLookup(context, frame, "objects");
if(t_11) {var t_10 = t_11.length;
for(var t_9=0; t_9 < t_11.length; t_9++) {
var t_12 = t_11[t_9];
frame.set("item", t_12);
frame.set("loop.index", t_9 + 1);
frame.set("loop.index0", t_9);
frame.set("loop.revindex", t_10 - t_9);
frame.set("loop.revindex0", t_10 - t_9 - 1);
frame.set("loop.first", t_9 === 0);
frame.set("loop.last", t_9 === t_10 - 1);
frame.set("loop.length", t_10);
output += "\n            <div class=\"row item hoverable";
if(runtime.memberLookup((t_12),"onair")) {
output += " onair";
;
}
output += "\"\n                data-uuid=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_12),"item")),"uuid"), env.opts.autoescape);
output += "\">\n\n                <div class=\"col-airtime columns\">\n                    ";
if(runtime.memberLookup((t_12),"onair")) {
output += "\n                    <span>On Air</span>\n                    ";
;
}
else {
output += "\n                        ";
if(runtime.memberLookup((t_12),"time_start")) {
output += "\n                        ";
output += runtime.suppressValue(env.getFilter("datetime2hhmmss").call(context, runtime.memberLookup((t_12),"time_start")), env.opts.autoescape);
output += "\n                        ";
;
}
output += "\n                    ";
;
}
output += "\n                    &nbsp;\n                </div>\n\n                <div class=\"col-action columns\">\n\n                    <div class=\"controls hoverable\">\n\n                        <span class=\"play\">\n                            <a href=\"#\" data-login-required data-bplayer-controls=\"play\"><i class=\"fa fa-play\"></i></a>\n                        </span>\n\n                        <span class=\"pause\">\n                            <a data-bplayer-controls=\"pause\" href=\"#\"><i class=\"fa fa-pause\"></i></a>\n                        </span>\n\n                    </div>\n\n\n\n                </div>\n\n                <div class=\"col-name columns\">\n                    ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_12),"item")),"name"), env.opts.autoescape);
output += "\n                </div>\n\n                <div class=\"col-artist columns\">\n                    ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_12),"item")),"artist")),"name"), env.opts.autoescape);
output += "\n                </div>\n\n                <!-- price & buy are not available yet - just here for the future\n                <div class=\"col-price columns\">\n                    ";
if(runtime.memberLookup((t_12),"onair")) {
output += "\n                        <span class=\"price\">CHF 0.20</span>\n                        <span class=\"increase-step\">+0.10 in</span>\n                        <span class=\"increase-time\">17sec</span>\n                    ";
;
}
else {
output += "\n                        <span>CHF 0.50</span>\n                    ";
;
}
output += "\n\n                </div>\n                <div class=\"col-buy columns text-right\">\n                    <a data-login-required href=\"#\">Buy Now!</a>\n                </div>\n                -->\n\n            </div>\n            ";
;
}
}
frame = frame.pop();
output += "\n\n        </div>\n\n    </section>\n\n";
;
}
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["bplayer/nj/image.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"image\"\n     data-resource_uri=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"resource_uri"), env.opts.autoescape);
output += "\"\n     data-id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"id"), env.opts.autoescape);
output += "\"\n     data-uuid=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"uuid"), env.opts.autoescape);
output += "\">\n    <div>\n\n        <ul data-orbit>\n            ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"release")),"main_image")) {
output += "\n            <li>\n                <img src=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"release")),"main_image"), env.opts.autoescape);
output += "\" alt=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"release")),"name"), env.opts.autoescape);
output += "\" width=\"570\">\n                <div class=\"orbit-caption\">\n                    ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"release")),"name"), env.opts.autoescape);
output += "\n                </div>\n            </li>\n            ";
;
}
output += "\n            ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"artist")),"main_image")) {
output += "\n            <li>\n                <img src=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"artist")),"main_image"), env.opts.autoescape);
output += "\" alt=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"artist")),"name"), env.opts.autoescape);
output += "\" width=\"570\">\n                <div class=\"orbit-caption\">\n                    ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"artist")),"name"), env.opts.autoescape);
output += "\n                </div>\n            </li>\n            ";
;
}
output += "\n        </ul>\n\n\n    </div>\n</div>\n\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["bplayer/nj/playing.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"information item media\"\n    data-resource_uri=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"resource_uri"), env.opts.autoescape);
output += "\"\n    data-id=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"id"), env.opts.autoescape);
output += "\"\n    data-uuid=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"uuid"), env.opts.autoescape);
output += "\">\n    <div>\n        <ul class=\"inline-list\">\n\n            <li class=\"right\"><a data-action=\"collect\" href=\"#\"><i class=\"fa fa-plus\"></i></a></li>\n\n            <li>";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"name"), env.opts.autoescape);
output += "</li>\n            <li>|</li>\n            <li><a href=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"artist")),"absolute_url"), env.opts.autoescape);
output += "\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"artist")),"name"), env.opts.autoescape);
output += "</a></li>\n            <li>|</li>\n            <li><a href=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"release")),"absolute_url"), env.opts.autoescape);
output += "\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"release")),"name"), env.opts.autoescape);
output += "</a></li>\n        </ul>\n    </div>\n</div>\n\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["bplayer/nj/playlist_compact.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"row base small-collapse medium-uncollapse\">\n    <div class=\"small-12 columns\">\n\n\n        <div class=\"row collapse\">\n\n            <div class=\"columns small-1\">\n\n                <div class=\"actions left\">\n                    <a data-bplayer-controls=\"resume\" href=\"#\"><i class=\"fa fa-play\"></i></a>\n                    <a data-bplayer-controls=\"pause\" href=\"#\"><i class=\"fa fa-pause\"></i></a>\n                </div>\n\n            </div>\n\n            <div class=\"columns small-10\">\n                <section class=\"playlist history compact\">\n\n                    ";
if(!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "opts")),"onair") && runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "opts")),"mode") != "history") {
output += "\n\n                        <div class=\"item playing fallback-text\">\n                            <span>Unbekannter Titel - \"Emergency Player\"</span>\n                        </div>\n\n                    ";
;
}
else {
output += "\n\n                        ";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "objects");
if(t_3) {var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("item", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n                            ";
output += "\n                            <div class=\"item";
if(runtime.memberLookup((t_4),"onair")) {
output += " onair";
;
}
output += "\"\n                                data-uuid=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_4),"item")),"uuid"), env.opts.autoescape);
output += "\">\n\n                                <a href=\"#\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_4),"item")),"name"), env.opts.autoescape);
output += "</a>\n                                <br class=\"show-for-small-only\">\n                                <span>by</span>\n                                <a href=\"#\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_4),"item")),"artist")),"name"), env.opts.autoescape);
output += "</a>\n\n                            </div>\n                            ";
output += "\n                        ";
;
}
}
frame = frame.pop();
output += "\n\n                    ";
;
}
output += "\n\n                </section>\n            </div>\n\n            <div class=\"columns small-1\">\n\n                <div class=\"actions right\">\n                    <a data-bplayer-display=\"toggle-history\" href=\"#\"><i class=\"fa fa-angle-double-up\"></i></a>\n                </div>\n\n            </div>\n\n\n        </div>\n\n\n        <!--\n        <div class=\"controls-left\">\n            <ul class=\"actions inline-list no-bullet\">\n                <li><a data-bplayer-controls=\"pause\" href=\"#\"><i class=\"fa fa-pause\"></i></a></li>\n                <li><a data-bplayer-controls=\"resume\" href=\"#\"><i class=\"fa fa-play\"></i></a></li>\n            </ul>\n        </div>\n\n        <section class=\"playlist history compact\">\n\n            ";
if(!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "opts")),"onair") && runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "opts")),"mode") != "history") {
output += "\n\n                <div class=\"item playing\">\n                    <span>Unbekannter Titel - \"Emergency Player\"</span>\n                </div>\n\n            ";
;
}
else {
output += "\n\n                ";
frame = frame.push();
var t_7 = runtime.contextOrFrameLookup(context, frame, "objects");
if(t_7) {var t_6 = t_7.length;
for(var t_5=0; t_5 < t_7.length; t_5++) {
var t_8 = t_7[t_5];
frame.set("item", t_8);
frame.set("loop.index", t_5 + 1);
frame.set("loop.index0", t_5);
frame.set("loop.revindex", t_6 - t_5);
frame.set("loop.revindex0", t_6 - t_5 - 1);
frame.set("loop.first", t_5 === 0);
frame.set("loop.last", t_5 === t_6 - 1);
frame.set("loop.length", t_6);
output += "\n                    ";
output += "\n                    <div class=\"item";
if(runtime.memberLookup((t_8),"onair")) {
output += " onair";
;
}
output += "\"\n                        data-uuid=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_8),"item")),"uuid"), env.opts.autoescape);
output += "\">\n\n                        <a href=\"#\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_8),"item")),"name"), env.opts.autoescape);
output += "</a>\n                        <br class=\"show-for-small-only\">\n                        <span>by</span>\n                        <a href=\"#\">";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_8),"item")),"artist")),"name"), env.opts.autoescape);
output += "</a>\n\n                    </div>\n                    ";
output += "\n                ";
;
}
}
frame = frame.pop();
output += "\n\n            ";
;
}
output += "\n\n        </section>\n\n        <div class=\"controls-right\">\n            <ul class=\"actions inline-list no-bullet\">\n                <li class=\"right_\"><a data-bplayer-display=\"toggle-history\" href=\"#\"><i class=\"fa fa-angle-double-up\"></i></a></li>\n            </ul>\n        </div>\n        -->\n\n    </div>\n</div>\n\n\n\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["bplayer/nj/playlist_expanded.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"row base small-collapse medium-collapse large-uncollapse\">\n    <div class=\"small-12 columns\">\n\n\n        <section class=\"playlist history expanded\">\n\n            <!-- expanded/table style display -->\n            <div>\n\n                <div class=\"row header collapse\">\n                    <div class=\"col-airtime columns\">\n                        Airtime\n                    </div>\n                    <div class=\"col-action columns\">\n                        &nbsp;\n                    </div>\n                    <div class=\"col-name columns\">\n                        Title\n                    </div>\n                    <div class=\"col-artist columns\">\n                        Artist\n                    </div>\n                    <!-- price & buy are not available yet - just here for the future\n                    <div class=\"col-price columns\">\n                        Price\n                    </div>\n                    <div class=\"col-buy columns end\">\n                        &nbsp;\n                    </div>\n                    -->\n\n                </div>\n\n\n                <!---->\n                ";
if(!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "opts")),"onair")) {
output += "\n\n                    <div class=\"row item collapse playing\">\n\n                        <div class=\"col-airtime columns\">\n                            <span>On Air</span>\n                        </div>\n\n                        <div class=\"col-action columns\">\n\n                            <div class=\"controls hoverable\">\n\n                                <span class=\"play\">\n                                    <a href=\"#\" data-login-required data-bplayer-controls=\"play\"><i class=\"fa fa-play\"></i></a>\n                                </span>\n\n                                <span class=\"pause\">\n                                    <a data-bplayer-controls=\"pause\" href=\"#\"><i class=\"fa fa-pause\"></i></a>\n                                </span>\n\n                            </div>\n\n                        </div>\n\n                        <div class=\"col-name columns\">\n                            Unbekannter Titel - \"Emergency Player\"\n                        </div>\n\n                    </div>\n\n                ";
;
}
else {
output += "\n\n\n                ";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "objects");
if(t_3) {var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("item", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\n\n\n                    <div class=\"row item collapse hoverable";
if(runtime.memberLookup((t_4),"onair")) {
output += " onair";
;
}
output += "\"\n                         data-uuid=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_4),"item")),"uuid"), env.opts.autoescape);
output += "\">\n\n                        <div class=\"col-airtime columns\">\n                            ";
if(runtime.memberLookup((t_4),"onair")) {
output += "\n                                <span>On Air</span>\n                            ";
;
}
else {
output += "\n                                ";
if(runtime.memberLookup((t_4),"time_start")) {
output += "\n                                    ";
output += runtime.suppressValue(env.getFilter("datetime2hhmmss").call(context, runtime.memberLookup((t_4),"time_start")), env.opts.autoescape);
output += "\n                                ";
;
}
output += "\n                            ";
;
}
output += "\n                            &nbsp;\n                        </div>\n\n                        <div class=\"col-action columns\">\n\n                            <div class=\"controls hoverable\">\n\n                                <span class=\"play\">\n                                    <a href=\"#\" data-login-required data-bplayer-controls=\"play\"><i class=\"fa fa-play\"></i></a>\n                                </span>\n\n                                <span class=\"pause\">\n                                    <a data-bplayer-controls=\"pause\" href=\"#\"><i class=\"fa fa-pause\"></i></a>\n                                </span>\n\n                            </div>\n\n                        </div>\n\n                        <div class=\"col-name columns\">\n                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((t_4),"item")),"name"), env.opts.autoescape);
output += "\n                        </div>\n\n                        <div class=\"col-artist columns\">\n                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((t_4),"item")),"artist")),"name"), env.opts.autoescape);
output += "\n                        </div>\n\n                        <!-- price & buy are not available yet - just here for the future\n                        <div class=\"col-price columns\">\n                            ";
if(runtime.memberLookup((t_4),"onair")) {
output += "\n                                <span class=\"price\">CHF 0.20</span>\n                                <span class=\"increase-step\">+0.10 in</span>\n                                <span class=\"increase-time\">17sec</span>\n                            ";
;
}
else {
output += "\n                                <span>CHF 0.50</span>\n                            ";
;
}
output += "\n\n                        </div>\n                        <div class=\"col-buy columns\">\n                            <a data-login-required href=\"#\"><span>Kaufen!</span></a>\n                        </div>\n                        -->\n\n\n                    </div>\n                ";
;
}
}
frame = frame.pop();
output += "\n\n\n\n                ";
;
}
output += "\n\n            </div>\n\n        </section>\n\n    </div>\n</div>\n\n\n<div class=\"actions-expanded\">\n    <ul class=\"no-bullet\">\n        <li><a data-bplayer-display=\"toggle-history\" href=\"#\">\n            <i class=\"fa fa-fw fa-angle-double-down\"></i></a>\n        </li>\n    </ul>\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["bplayer/nj/totals.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<span>Playing ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "data")),"index"), env.opts.autoescape);
output += " of ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "data")),"num_tracks"), env.opts.autoescape);
output += " Tracks | ";
output += runtime.suppressValue(env.getFilter("s2time").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "data")),"duration")), env.opts.autoescape);
output += " Total</span>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["bplayer/nj/waveform.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<div class=\"playhead\">\n\n    <!-- background layer (for hover/active/etc ? ) -->\n    <div class=\"background\">\n\n        <!-- holder for indicator (animated transparent png-24 bg.image) -->\n        <div class=\"indicator\">\n\n\n            <div class=\"loading\">\n\n                <!-- holder for handler (animated transparent png-24 bg.image) -->\n                <div class=\"handler\">\n\n                    <!-- actual waveform (transparent inner) -->\n                    <div class=\"waveform\">\n\n                        <img data-href=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"waveform_light"), env.opts.autoescape);
output += "\"\n                             src=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"waveform_light"), env.opts.autoescape);
output += "\"\n                             style=\"width: 100%; height: 100%\"/>\n\n                        </img>\n\n                    </div>\n\n                </div>\n\n            </div>\n\n        </div>\n\n    </div>\n\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["onair/nj/item.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<!-- loaded dynamically to: #onair_container > .items -->\n\n\n\n\n<!-- item in this context: \"track\" - active or history -->\n<div\n    class=\"item info ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "extra_classes"), env.opts.autoescape);
output += "\"\n    id=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "dom_id"), env.opts.autoescape);
output += "\"\n    data-time_start=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"time_start"), env.opts.autoescape);
output += "\"\n    data-uuid=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"uuid"), env.opts.autoescape);
output += "\"\n    data-onair=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"onair"), env.opts.autoescape);
output += "\"\n    data-index=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "index"), env.opts.autoescape);
output += "\">\n\n    <!-- base container - media -->\n    <div class=\"container\">\n\n        ";
if(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"release") && runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"release")),"main_image")) {
output += "\n        <div class=\"image-container\">\n            <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"release")),"main_image"), env.opts.autoescape);
output += "\">\n        </div>\n        ";
;
}
output += "\n\n        <!-- swapable container - artist/label/etc -->\n        <div class=\"details\">\n\n            <!--\n            TODO: for some reason (pre-compile required?) includes don't work when compiling via gulp.\n            html moved inline insetad if include.\n            -->\n\n\n                <!-- item_playlist.html -->\n                ";
var t_1;
t_1 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"content_object");
frame.set("item", t_1, true);
if(frame.topLevel) {
context.setVariable("item", t_1);
}
if(frame.topLevel) {
context.addExport("item", t_1);
}
output += "\n                ";
if(runtime.contextOrFrameLookup(context, frame, "item")) {
output += "\n                    <div data-ct=\"playlist\" class=\"ct-panel\">\n\n                        <div class=\"row header\">\n\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "\n                            <div class=\"small-6 columns\">\n                                <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image"), env.opts.autoescape);
output += "\">\n                            </div>\n                            ";
;
}
output += "\n\n                            <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                                <div class=\"text-left\">\n                                    <h1>";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name"),24), env.opts.autoescape);
output += "</h1>\n                                    <ul class=\"no-bullet\">\n\n                                        <li>\n                                            ";
output += runtime.suppressValue(env.getFilter("datetime2hhmm").call(context, runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"time_start")), env.opts.autoescape);
output += "\n                                            -\n                                            ";
output += runtime.suppressValue(env.getFilter("datetime2hhmm").call(context, runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"time_end")), env.opts.autoescape);
output += "\n                                        </li>\n\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"duration")) {
output += "\n                                        <li>\n                                            ";
output += runtime.suppressValue(env.getFilter("ms2time").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"duration")), env.opts.autoescape);
output += "\n                                        </li>\n                                        ";
;
}
output += "\n                                    </ul>\n                                </div>\n                            </div>\n                        </div>\n\n                        <div class=\"row body  show-for-large-up\">\n                            <div class=\"small-12 columns\">\n                                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description")) {
output += "\n                                <p>\n                                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description"),240), env.opts.autoescape);
output += "\n                                </p>\n                                ";
;
}
output += "\n                            </div>\n                        </div>\n\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n                        <div class=\"row tags text-left\">\n                            <div class=\"small-12 columns\">\n                                ";
frame = frame.push();
var t_4 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_4) {var t_3 = t_4.length;
for(var t_2=0; t_2 < t_4.length; t_2++) {
var t_5 = t_4[t_2];
frame.set("tag", t_5);
frame.set("loop.index", t_2 + 1);
frame.set("loop.index0", t_2);
frame.set("loop.revindex", t_3 - t_2);
frame.set("loop.revindex0", t_3 - t_2 - 1);
frame.set("loop.first", t_2 === 0);
frame.set("loop.last", t_2 === t_3 - 1);
frame.set("loop.length", t_3);
output += "\n                                <span class=\"tag\">";
output += runtime.suppressValue(t_5, env.opts.autoescape);
output += "</span>\n                                ";
;
}
}
frame = frame.pop();
output += "\n                            </div>\n                        </div>\n                        ";
;
}
output += "\n\n                    </div>\n                ";
;
}
output += "\n\n\n                <!-- item_author.html -->\n                ";
var t_6;
t_6 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"user_co_profile");
frame.set("item", t_6, true);
if(frame.topLevel) {
context.setVariable("item", t_6);
}
if(frame.topLevel) {
context.addExport("item", t_6);
}
output += "\n                ";
if(runtime.contextOrFrameLookup(context, frame, "item")) {
output += "\n                    <div data-ct=\"author\" class=\"ct-panel\">\n\n                        <div class=\"row header\">\n\n\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"image")) {
output += "\n                            <div class=\"small-6 columns\">\n                                <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"image"), env.opts.autoescape);
output += "\">\n                            </div>\n                            ";
;
}
output += "\n\n\n                            <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                                <div class=\"text-left\">\n                                    <h1>";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"display_name"),24), env.opts.autoescape);
output += "</h1>\n                                    <ul class=\"no-bullet\">\n\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"pseudonym")) {
output += "\n                                        <li>\n                                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"pseudonym"), env.opts.autoescape);
output += "\n                                        </li>\n                                        ";
;
}
output += "\n\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"city") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                        <li>\n                                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"city")) {
output += "\n                                                ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"city")), env.opts.autoescape);
output += "\n                                            ";
;
}
output += "\n                                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"city") && runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += ", ";
;
}
output += "\n                                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                                ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")), env.opts.autoescape);
output += "\n                                            ";
;
}
output += "\n                                        </li>\n                                        ";
;
}
output += "\n\n\n\n                                    </ul>\n                                </div>\n                            </div>\n                        </div>\n\n                        <div class=\"row body show-for-large-up\">\n                            <div class=\"small-12 columns\">\n                                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"biography")) {
output += "\n                                <p>\n                                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"biography"),240), env.opts.autoescape);
output += "\n                                </p>\n                                ";
;
}
output += "\n                            </div>\n                        </div>\n\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n                        <div class=\"row tags text-left\">\n                            <div class=\"small-12 columns\">\n                                ";
frame = frame.push();
var t_9 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_9) {var t_8 = t_9.length;
for(var t_7=0; t_7 < t_9.length; t_7++) {
var t_10 = t_9[t_7];
frame.set("tag", t_10);
frame.set("loop.index", t_7 + 1);
frame.set("loop.index0", t_7);
frame.set("loop.revindex", t_8 - t_7);
frame.set("loop.revindex0", t_8 - t_7 - 1);
frame.set("loop.first", t_7 === 0);
frame.set("loop.last", t_7 === t_8 - 1);
frame.set("loop.length", t_8);
output += "\n                                <span class=\"tag\">";
output += runtime.suppressValue(t_10, env.opts.autoescape);
output += "</span>\n                                ";
;
}
}
frame = frame.pop();
output += "\n                            </div>\n                        </div>\n                        ";
;
}
output += "\n\n                    </div>\n                ";
;
}
output += "\n\n\n                <!-- item_media.html -->\n                ";
var t_11;
t_11 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item");
frame.set("item", t_11, true);
if(frame.topLevel) {
context.setVariable("item", t_11);
}
if(frame.topLevel) {
context.addExport("item", t_11);
}
output += "\n                <div data-ct=\"media\" class=\"ct-panel\">\n\n                    <div class=\"row header\">\n\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"release") && runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"release")),"main_image")) {
output += "\n                        <div class=\"small-6 columns\">\n                            <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"release")),"main_image"), env.opts.autoescape);
output += "\">\n                        </div>\n                        ";
;
}
output += "\n\n                        <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"release") && runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"release")),"main_image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                            <div class=\"text-left\">\n                                <h1>";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name")) {
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name"),24), env.opts.autoescape);
;
}
output += "</h1>\n                                <ul class=\"no-bullet\">\n                                    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"mediatype") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"version")) {
output += "\n                                    <li>\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"mediatype")) {
output += "\n                                            ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"mediatype")), env.opts.autoescape);
output += "\n                                        ";
;
}
output += "\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"version")) {
output += "\n                                            (";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"version")), env.opts.autoescape);
output += ")\n                                        ";
;
}
output += "\n                                    </li>\n                                    ";
;
}
output += "\n                                    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"duration")) {
output += "\n                                    <li>\n                                        ";
output += runtime.suppressValue(env.getFilter("ms2time").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"duration")), env.opts.autoescape);
output += "\n                                    </li>\n                                    ";
;
}
output += "\n                                </ul>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class=\"row body show-for-large-up\">\n                        <div class=\"small-12 columns\">\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description")) {
output += "\n                            <p>\n                                ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description"),240), env.opts.autoescape);
output += "\n                            </p>\n                            ";
;
}
output += "\n                        </div>\n                    </div>\n\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n                        <div class=\"row tags text-left\">\n                            <div class=\"small-12 columns\">\n                                ";
frame = frame.push();
var t_14 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_14) {var t_13 = t_14.length;
for(var t_12=0; t_12 < t_14.length; t_12++) {
var t_15 = t_14[t_12];
frame.set("tag", t_15);
frame.set("loop.index", t_12 + 1);
frame.set("loop.index0", t_12);
frame.set("loop.revindex", t_13 - t_12);
frame.set("loop.revindex0", t_13 - t_12 - 1);
frame.set("loop.first", t_12 === 0);
frame.set("loop.last", t_12 === t_13 - 1);
frame.set("loop.length", t_13);
output += "\n                                <span class=\"tag\">";
output += runtime.suppressValue(t_15, env.opts.autoescape);
output += "</span>\n                                ";
;
}
}
frame = frame.pop();
output += "\n                            </div>\n                        </div>\n                        ";
;
}
output += "\n\n                </div>\n\n                <!-- item_artist.html -->\n                ";
var t_16;
t_16 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"artist");
frame.set("item", t_16, true);
if(frame.topLevel) {
context.setVariable("item", t_16);
}
if(frame.topLevel) {
context.addExport("item", t_16);
}
output += "\n                ";
if(runtime.contextOrFrameLookup(context, frame, "item")) {
output += "\n                    <div data-ct=\"artist\" class=\"ct-panel\">\n\n                        <div class=\"row header\">\n\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "\n                            <div class=\"small-6 columns\">\n                                <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image"), env.opts.autoescape);
output += "\">\n                            </div>\n                            ";
;
}
output += "\n\n                            <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                                <div class=\"text-left\">\n                                    <h1>";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name"),24), env.opts.autoescape);
output += "</h1>\n                                    <ul class=\"no-bullet\">\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"type") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                        <li>\n                                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                                (";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country"), env.opts.autoescape);
output += ")\n                                            ";
;
}
output += "\n                                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"type")) {
output += "\n                                                ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"type")), env.opts.autoescape);
output += "\n                                            ";
;
}
output += "\n                                        </li>\n                                        ";
;
}
output += "\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_start") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_start")) {
output += "\n                                        <li>\n                                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_start"), env.opts.autoescape);
output += "\n                                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_start") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_start")) {
output += " - ";
;
}
output += "\n                                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_end"), env.opts.autoescape);
output += "\n                                        </li>\n                                        ";
;
}
output += "\n                                    </ul>\n                                </div>\n                            </div>\n                        </div>\n\n                        <div class=\"row body show-for-large-up\">\n                            <div class=\"small-12 columns\">\n                                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"biography")) {
output += "\n                                <p>\n                                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, env.getFilter("strip_markdown").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"biography")),240), env.opts.autoescape);
output += "\n                                </p>\n                                ";
;
}
output += "\n                            </div>\n                        </div>\n\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n                        <div class=\"row tags text-left\">\n                            <div class=\"small-12 columns\">\n                                ";
frame = frame.push();
var t_19 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_19) {var t_18 = t_19.length;
for(var t_17=0; t_17 < t_19.length; t_17++) {
var t_20 = t_19[t_17];
frame.set("tag", t_20);
frame.set("loop.index", t_17 + 1);
frame.set("loop.index0", t_17);
frame.set("loop.revindex", t_18 - t_17);
frame.set("loop.revindex0", t_18 - t_17 - 1);
frame.set("loop.first", t_17 === 0);
frame.set("loop.last", t_17 === t_18 - 1);
frame.set("loop.length", t_18);
output += "\n                                <span class=\"tag\">";
output += runtime.suppressValue(t_20, env.opts.autoescape);
output += "</span>\n                                ";
;
}
}
frame = frame.pop();
output += "\n                            </div>\n                        </div>\n                        ";
;
}
output += "\n\n                    </div>\n                ";
;
}
output += "\n\n                <!-- item_release.html -->\n                ";
var t_21;
t_21 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"release");
frame.set("item", t_21, true);
if(frame.topLevel) {
context.setVariable("item", t_21);
}
if(frame.topLevel) {
context.addExport("item", t_21);
}
output += "\n                ";
if(runtime.contextOrFrameLookup(context, frame, "item")) {
output += "\n                    <div data-ct=\"release\" class=\"ct-panel\">\n\n                        <div class=\"row header\">\n\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "\n                            <div class=\"small-6 columns\">\n                                <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image"), env.opts.autoescape);
output += "\">\n                            </div>\n                            ";
;
}
output += "\n\n                            <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                                <div class=\"text-left\">\n                                    <h1>";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name"),32), env.opts.autoescape);
output += "</h1>\n                                    <ul class=\"no-bullet\">\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                        <li>\n                                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                                ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country"), env.opts.autoescape);
output += "\n                                            ";
;
}
output += "\n                                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype")) {
output += "\n                                                ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype")), env.opts.autoescape);
output += "\n                                            ";
;
}
output += "\n                                        </li>\n                                        ";
;
}
output += "\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasedate_approx")) {
output += "\n                                        <li>\n                                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasedate_approx"), env.opts.autoescape);
output += "\n                                        </li>\n                                        ";
;
}
output += "\n                                    </ul>\n                                </div>\n                            </div>\n\n                        </div>\n\n                        <div class=\"row body show-for-large-up\">\n                            <div class=\"small-12 columns\">\n                                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description")) {
output += "\n                                <p>\n                                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description"),240), env.opts.autoescape);
output += "\n                                </p>\n                                ";
;
}
output += "\n                            </div>\n                        </div>\n\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n                        <div class=\"row tags text-left\">\n                            <div class=\"small-12 columns\">\n                                ";
frame = frame.push();
var t_24 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_24) {var t_23 = t_24.length;
for(var t_22=0; t_22 < t_24.length; t_22++) {
var t_25 = t_24[t_22];
frame.set("tag", t_25);
frame.set("loop.index", t_22 + 1);
frame.set("loop.index0", t_22);
frame.set("loop.revindex", t_23 - t_22);
frame.set("loop.revindex0", t_23 - t_22 - 1);
frame.set("loop.first", t_22 === 0);
frame.set("loop.last", t_22 === t_23 - 1);
frame.set("loop.length", t_23);
output += "\n                                <span class=\"tag\">";
output += runtime.suppressValue(t_25, env.opts.autoescape);
output += "</span>\n                                ";
;
}
}
frame = frame.pop();
output += "\n                            </div>\n                        </div>\n                        ";
;
}
output += "\n\n                    </div>\n                ";
;
}
output += "\n\n                <!-- item_label.html -->\n                ";
var t_26;
t_26 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"label");
frame.set("item", t_26, true);
if(frame.topLevel) {
context.setVariable("item", t_26);
}
if(frame.topLevel) {
context.addExport("item", t_26);
}
output += "\n                ";
if(runtime.contextOrFrameLookup(context, frame, "item")) {
output += "\n                    <div data-ct=\"label\" class=\"ct-panel\">\n\n                        <div class=\"row header\">\n\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "\n                            <div class=\"small-6 columns\">\n                                <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image"), env.opts.autoescape);
output += "\">\n                            </div>\n                            ";
;
}
output += "\n\n                            <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                                <div class=\"text-left\">\n                                    <h1>";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name"),24), env.opts.autoescape);
output += "</h1>\n                                    <ul class=\"no-bullet\">\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                        <li>\n                                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                                (";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country"), env.opts.autoescape);
output += ")\n                                            ";
;
}
output += "\n                                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype")) {
output += "\n                                                ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype")), env.opts.autoescape);
output += "\n                                            ";
;
}
output += "\n                                        </li>\n                                        ";
;
}
output += "\n                                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasedate_approx")) {
output += "\n                                        <li>\n                                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasedate_approx"), env.opts.autoescape);
output += "\n                                        </li>\n                                        ";
;
}
output += "\n                                    </ul>\n                                </div>\n                            </div>\n                        </div>\n\n                        <div class=\"row body show-for-large-up\">\n                            <div class=\"small-12 columns\">\n                                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description")) {
output += "\n                                <p>\n                                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, env.getFilter("strip_markdown").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description")),240), env.opts.autoescape);
output += "\n                                </p>\n                                ";
;
}
output += "\n                            </div>\n                        </div>\n\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n                        <div class=\"row tags text-left\">\n                            <div class=\"small-12 columns\">\n                                ";
frame = frame.push();
var t_29 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_29) {var t_28 = t_29.length;
for(var t_27=0; t_27 < t_29.length; t_27++) {
var t_30 = t_29[t_27];
frame.set("tag", t_30);
frame.set("loop.index", t_27 + 1);
frame.set("loop.index0", t_27);
frame.set("loop.revindex", t_28 - t_27);
frame.set("loop.revindex0", t_28 - t_27 - 1);
frame.set("loop.first", t_27 === 0);
frame.set("loop.last", t_27 === t_28 - 1);
frame.set("loop.length", t_28);
output += "\n                                <span class=\"tag\">";
output += runtime.suppressValue(t_30, env.opts.autoescape);
output += "</span>\n                                ";
;
}
}
frame = frame.pop();
output += "\n                            </div>\n                        </div>\n                        ";
;
}
output += "\n\n                    </div>\n                ";
;
}
output += "\n\n\n\n        </div>\n\n        <!-- action wrapper - play/pause/listen -->\n        <div class=\"wrapper\">\n\n            <div class=\"controls hoverable\">\n\n                <span class=\"play\">\n                    <a href=\"#\" data-login-required data-onair-controls=\"play\">Play</a>\n                </span>\n\n                <span class=\"listen\">\n                    <a data-onair-controls=\"play\" href=\"#\">Listen</a>\n                </span>\n\n                <span class=\"pause\">\n                    <a data-onair-controls=\"pause\" href=\"#\"><i class=\"fa fa-pause\"></i></a>\n                </span>\n\n                <span class=\"loading\">\n                    <a href=\"#\">\n\n                        <div class=\"la-ball-clip-rotate-pulse la-2x\">\n                            <div></div>\n                            <div></div>\n                        </div>\n\n                        <!--<i class=\"fa fa-circle-o-notch fa-spin fa-fw\"></i>-->\n                    </a>\n                </span>\n\n            </div>\n\n        </div>\n\n        <!-- levelbridge live-data -->\n        <div class=\"level-container\">\n            <ul class=\"level\"></ul>\n        </div>\n\n        <div class=\"progress-container hoverable\">\n            <div class=\"progress\">\n              <span class=\"meter\" style=\"width: 0%\"></span>\n              <span class=\"buffer\" style=\"width: 0%\"></span>\n            </div>\n        </div>\n\n    </div>\n\n</div>\n<!-- item end -->";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["onair/nj/item_artist.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
var t_1;
t_1 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"artist");
frame.set("item", t_1, true);
if(frame.topLevel) {
context.setVariable("item", t_1);
}
if(frame.topLevel) {
context.addExport("item", t_1);
}
output += "\n";
if(runtime.contextOrFrameLookup(context, frame, "item")) {
output += "\n    <div data-ct=\"artist\" class=\"ct-panel\">\n\n        <div class=\"row header\">\n\n            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "\n            <div class=\"small-6 columns\">\n                <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image"), env.opts.autoescape);
output += "\">\n            </div>\n            ";
;
}
output += "\n\n            <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                <div class=\"text-left\">\n                    <h1>";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name"),24), env.opts.autoescape);
output += "</h1>\n                    <ul class=\"no-bullet\">\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"type") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                        <li>\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                (";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country"), env.opts.autoescape);
output += ")\n                            ";
;
}
output += "\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"type")) {
output += "\n                                ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"type")), env.opts.autoescape);
output += "\n                            ";
;
}
output += "\n                        </li>\n                        ";
;
}
output += "\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_start") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_start")) {
output += "\n                        <li>\n                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_start"), env.opts.autoescape);
output += "\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_start") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_start")) {
output += " - ";
;
}
output += "\n                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"date_end"), env.opts.autoescape);
output += "\n                        </li>\n                        ";
;
}
output += "\n                    </ul>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"row body show-for-large-up\">\n            <div class=\"small-12 columns\">\n                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"biography")) {
output += "\n                <p>\n                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, env.getFilter("strip_markdown").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"biography")),240), env.opts.autoescape);
output += "\n                </p>\n                ";
;
}
output += "\n            </div>\n        </div>\n\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n        <div class=\"row tags text-left\">\n            <div class=\"small-12 columns\">\n                ";
frame = frame.push();
var t_4 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_4) {var t_3 = t_4.length;
for(var t_2=0; t_2 < t_4.length; t_2++) {
var t_5 = t_4[t_2];
frame.set("tag", t_5);
frame.set("loop.index", t_2 + 1);
frame.set("loop.index0", t_2);
frame.set("loop.revindex", t_3 - t_2);
frame.set("loop.revindex0", t_3 - t_2 - 1);
frame.set("loop.first", t_2 === 0);
frame.set("loop.last", t_2 === t_3 - 1);
frame.set("loop.length", t_3);
output += "\n                <span class=\"tag\">";
output += runtime.suppressValue(t_5, env.opts.autoescape);
output += "</span>\n                ";
;
}
}
frame = frame.pop();
output += "\n            </div>\n        </div>\n        ";
;
}
output += "\n\n    </div>\n";
;
}
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["onair/nj/item_author.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
var t_1;
t_1 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"user_co_profile");
frame.set("item", t_1, true);
if(frame.topLevel) {
context.setVariable("item", t_1);
}
if(frame.topLevel) {
context.addExport("item", t_1);
}
output += "\n\n";
if(runtime.contextOrFrameLookup(context, frame, "item")) {
output += "\n    <div data-ct=\"author\" class=\"ct-panel\">\n\n        <div class=\"row header\">\n\n\n            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"image")) {
output += "\n            <div class=\"small-6 columns\">\n                <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"image"), env.opts.autoescape);
output += "\">\n            </div>\n            ";
;
}
output += "\n\n\n            <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                <div class=\"text-left\">\n                    <h1>";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"display_name"),24), env.opts.autoescape);
output += "</h1>\n                    <ul class=\"no-bullet\">\n\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"pseudonym")) {
output += "\n                        <li>\n                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"pseudonym"), env.opts.autoescape);
output += "\n                        </li>\n                        ";
;
}
output += "\n\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"city") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                        <li>\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"city")) {
output += "\n                                ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"city")), env.opts.autoescape);
output += "\n                            ";
;
}
output += "\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"city") && runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += ", ";
;
}
output += "\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")), env.opts.autoescape);
output += "\n                            ";
;
}
output += "\n                        </li>\n                        ";
;
}
output += "\n\n\n\n                    </ul>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"row body show-for-large-up\">\n            <div class=\"small-12 columns\">\n                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"biography")) {
output += "\n                <p>\n                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"biography"),240), env.opts.autoescape);
output += "\n                </p>\n                ";
;
}
output += "\n            </div>\n        </div>\n\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n        <div class=\"row tags text-left\">\n            <div class=\"small-12 columns\">\n                ";
frame = frame.push();
var t_4 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_4) {var t_3 = t_4.length;
for(var t_2=0; t_2 < t_4.length; t_2++) {
var t_5 = t_4[t_2];
frame.set("tag", t_5);
frame.set("loop.index", t_2 + 1);
frame.set("loop.index0", t_2);
frame.set("loop.revindex", t_3 - t_2);
frame.set("loop.revindex0", t_3 - t_2 - 1);
frame.set("loop.first", t_2 === 0);
frame.set("loop.last", t_2 === t_3 - 1);
frame.set("loop.length", t_3);
output += "\n                <span class=\"tag\">";
output += runtime.suppressValue(t_5, env.opts.autoescape);
output += "</span>\n                ";
;
}
}
frame = frame.pop();
output += "\n            </div>\n        </div>\n        ";
;
}
output += "\n\n    </div>\n";
;
}
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["onair/nj/item_label.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
var t_1;
t_1 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"label");
frame.set("item", t_1, true);
if(frame.topLevel) {
context.setVariable("item", t_1);
}
if(frame.topLevel) {
context.addExport("item", t_1);
}
output += "\n";
if(runtime.contextOrFrameLookup(context, frame, "item")) {
output += "\n    <div data-ct=\"label\" class=\"ct-panel\">\n\n        <div class=\"row header\">\n\n            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "\n            <div class=\"small-6 columns\">\n                <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image"), env.opts.autoescape);
output += "\">\n            </div>\n            ";
;
}
output += "\n\n            <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                <div class=\"text-left\">\n                    <h1>";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name"),24), env.opts.autoescape);
output += "</h1>\n                    <ul class=\"no-bullet\">\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                        <li>\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                (";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country"), env.opts.autoescape);
output += ")\n                            ";
;
}
output += "\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype")) {
output += "\n                                ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype")), env.opts.autoescape);
output += "\n                            ";
;
}
output += "\n                        </li>\n                        ";
;
}
output += "\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasedate_approx")) {
output += "\n                        <li>\n                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasedate_approx"), env.opts.autoescape);
output += "\n                        </li>\n                        ";
;
}
output += "\n                    </ul>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"row body show-for-large-up\">\n            <div class=\"small-12 columns\">\n                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description")) {
output += "\n                <p>\n                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, env.getFilter("strip_markdown").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description")),240), env.opts.autoescape);
output += "\n                </p>\n                ";
;
}
output += "\n            </div>\n        </div>\n\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n        <div class=\"row tags text-left\">\n            <div class=\"small-12 columns\">\n                ";
frame = frame.push();
var t_4 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_4) {var t_3 = t_4.length;
for(var t_2=0; t_2 < t_4.length; t_2++) {
var t_5 = t_4[t_2];
frame.set("tag", t_5);
frame.set("loop.index", t_2 + 1);
frame.set("loop.index0", t_2);
frame.set("loop.revindex", t_3 - t_2);
frame.set("loop.revindex0", t_3 - t_2 - 1);
frame.set("loop.first", t_2 === 0);
frame.set("loop.last", t_2 === t_3 - 1);
frame.set("loop.length", t_3);
output += "\n                <span class=\"tag\">";
output += runtime.suppressValue(t_5, env.opts.autoescape);
output += "</span>\n                ";
;
}
}
frame = frame.pop();
output += "\n            </div>\n        </div>\n        ";
;
}
output += "\n\n    </div>\n";
;
}
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["onair/nj/item_media.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
var t_1;
t_1 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item");
frame.set("item", t_1, true);
if(frame.topLevel) {
context.setVariable("item", t_1);
}
if(frame.topLevel) {
context.addExport("item", t_1);
}
output += "\n<div data-ct=\"media\" class=\"ct-panel\">\n\n    <div class=\"row header\">\n\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"release") && runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"release")),"main_image")) {
output += "\n        <div class=\"small-6 columns\">\n            <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"release")),"main_image"), env.opts.autoescape);
output += "\">\n        </div>\n        ";
;
}
output += "\n\n        <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"release") && runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"release")),"main_image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n            <div class=\"text-left\">\n                <h1>";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name")) {
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name"),24), env.opts.autoescape);
;
}
output += "</h1>\n                <ul class=\"no-bullet\">\n                    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"mediatype") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"version")) {
output += "\n                    <li>\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"mediatype")) {
output += "\n                            ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"mediatype")), env.opts.autoescape);
output += "\n                        ";
;
}
output += "\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"version")) {
output += "\n                            (";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"version")), env.opts.autoescape);
output += ")\n                        ";
;
}
output += "\n                    </li>\n                    ";
;
}
output += "\n                    ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"duration")) {
output += "\n                    <li>\n                        ";
output += runtime.suppressValue(env.getFilter("ms2time").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"duration")), env.opts.autoescape);
output += "\n                    </li>\n                    ";
;
}
output += "\n                </ul>\n            </div>\n        </div>\n    </div>\n\n    <div class=\"row body show-for-large-up\">\n        <div class=\"small-12 columns\">\n            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description")) {
output += "\n            <p>\n                ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description"),240), env.opts.autoescape);
output += "\n            </p>\n            ";
;
}
output += "\n        </div>\n    </div>\n\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n        <div class=\"row tags text-left\">\n            <div class=\"small-12 columns\">\n                ";
frame = frame.push();
var t_4 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_4) {var t_3 = t_4.length;
for(var t_2=0; t_2 < t_4.length; t_2++) {
var t_5 = t_4[t_2];
frame.set("tag", t_5);
frame.set("loop.index", t_2 + 1);
frame.set("loop.index0", t_2);
frame.set("loop.revindex", t_3 - t_2);
frame.set("loop.revindex0", t_3 - t_2 - 1);
frame.set("loop.first", t_2 === 0);
frame.set("loop.last", t_2 === t_3 - 1);
frame.set("loop.length", t_3);
output += "\n                <span class=\"tag\">";
output += runtime.suppressValue(t_5, env.opts.autoescape);
output += "</span>\n                ";
;
}
}
frame = frame.pop();
output += "\n            </div>\n        </div>\n        ";
;
}
output += "\n\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["onair/nj/item_playlist.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
var t_1;
t_1 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"content_object");
frame.set("item", t_1, true);
if(frame.topLevel) {
context.setVariable("item", t_1);
}
if(frame.topLevel) {
context.addExport("item", t_1);
}
output += "\n\n";
if(runtime.contextOrFrameLookup(context, frame, "item")) {
output += "\n    <div data-ct=\"playlist\" class=\"ct-panel\">\n\n        <div class=\"row header\">\n\n            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "\n            <div class=\"small-6 columns\">\n                <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image"), env.opts.autoescape);
output += "\">\n            </div>\n            ";
;
}
output += "\n\n            <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                <div class=\"text-left\">\n                    <h1>";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name"),24), env.opts.autoescape);
output += "</h1>\n                    <ul class=\"no-bullet\">\n\n                        <li>\n                            ";
output += runtime.suppressValue(env.getFilter("datetime2hhmm").call(context, runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"time_start")), env.opts.autoescape);
output += "\n                            -\n                            ";
output += runtime.suppressValue(env.getFilter("datetime2hhmm").call(context, runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"time_end")), env.opts.autoescape);
output += "\n                        </li>\n\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"duration")) {
output += "\n                        <li>\n                            ";
output += runtime.suppressValue(env.getFilter("ms2time").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"duration")), env.opts.autoescape);
output += "\n                        </li>\n                        ";
;
}
output += "\n                    </ul>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"row body  show-for-large-up\">\n            <div class=\"small-12 columns\">\n                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description")) {
output += "\n                <p>\n                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description"),240), env.opts.autoescape);
output += "\n                </p>\n                ";
;
}
output += "\n            </div>\n        </div>\n\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n        <div class=\"row tags text-left\">\n            <div class=\"small-12 columns\">\n                ";
frame = frame.push();
var t_4 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_4) {var t_3 = t_4.length;
for(var t_2=0; t_2 < t_4.length; t_2++) {
var t_5 = t_4[t_2];
frame.set("tag", t_5);
frame.set("loop.index", t_2 + 1);
frame.set("loop.index0", t_2);
frame.set("loop.revindex", t_3 - t_2);
frame.set("loop.revindex0", t_3 - t_2 - 1);
frame.set("loop.first", t_2 === 0);
frame.set("loop.last", t_2 === t_3 - 1);
frame.set("loop.length", t_3);
output += "\n                <span class=\"tag\">";
output += runtime.suppressValue(t_5, env.opts.autoescape);
output += "</span>\n                ";
;
}
}
frame = frame.pop();
output += "\n            </div>\n        </div>\n        ";
;
}
output += "\n\n    </div>\n";
;
}
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["onair/nj/item_release.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
var t_1;
t_1 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"release");
frame.set("item", t_1, true);
if(frame.topLevel) {
context.setVariable("item", t_1);
}
if(frame.topLevel) {
context.addExport("item", t_1);
}
output += "\n";
if(runtime.contextOrFrameLookup(context, frame, "item")) {
output += "\n    <div data-ct=\"release\" class=\"ct-panel\">\n\n        <div class=\"row header\">\n\n            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "\n            <div class=\"small-6 columns\">\n                <img src=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image"), env.opts.autoescape);
output += "\">\n            </div>\n            ";
;
}
output += "\n\n            <div class=\"";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"main_image")) {
output += "small-6";
;
}
else {
output += "small-12";
;
}
output += " columns\">\n                <div class=\"text-left\">\n                    <h1>";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"name"),32), env.opts.autoescape);
output += "</h1>\n                    <ul class=\"no-bullet\">\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype") || runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                        <li>\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country")) {
output += "\n                                ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"country"), env.opts.autoescape);
output += "\n                            ";
;
}
output += "\n                            ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype")) {
output += "\n                                ";
output += runtime.suppressValue(env.getFilter("capitalize").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasetype")), env.opts.autoescape);
output += "\n                            ";
;
}
output += "\n                        </li>\n                        ";
;
}
output += "\n                        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasedate_approx")) {
output += "\n                        <li>\n                            ";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"releasedate_approx"), env.opts.autoescape);
output += "\n                        </li>\n                        ";
;
}
output += "\n                    </ul>\n                </div>\n            </div>\n\n        </div>\n\n        <div class=\"row body show-for-large-up\">\n            <div class=\"small-12 columns\">\n                ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description")) {
output += "\n                <p>\n                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"description"),240), env.opts.autoescape);
output += "\n                </p>\n                ";
;
}
output += "\n            </div>\n        </div>\n\n        ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags")) {
output += "\n        <div class=\"row tags text-left\">\n            <div class=\"small-12 columns\">\n                ";
frame = frame.push();
var t_4 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "item")),"tags");
if(t_4) {var t_3 = t_4.length;
for(var t_2=0; t_2 < t_4.length; t_2++) {
var t_5 = t_4[t_2];
frame.set("tag", t_5);
frame.set("loop.index", t_2 + 1);
frame.set("loop.index0", t_2);
frame.set("loop.revindex", t_3 - t_2);
frame.set("loop.revindex0", t_3 - t_2 - 1);
frame.set("loop.first", t_2 === 0);
frame.set("loop.last", t_2 === t_3 - 1);
frame.set("loop.length", t_3);
output += "\n                <span class=\"tag\">";
output += runtime.suppressValue(t_5, env.opts.autoescape);
output += "</span>\n                ";
;
}
}
frame = frame.pop();
output += "\n            </div>\n        </div>\n        ";
;
}
output += "\n\n    </div>\n";
;
}
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["onair/nj/meta.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<!-- TODO: implement better responsive/mobile handling -->\n\n\n\n<div class=\"hide-for-large\" data-livefg>\n    <!-- track related -->\n    <p class=\"text-center\">\n        ";
output += runtime.suppressValue(env.getFilter("shorten").call(context, runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"artist")),"name"),30), env.opts.autoescape);
output += "\n        <br>\n        ";
output += runtime.suppressValue(env.getFilter("shorten").call(context, runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"name"),30), env.opts.autoescape);
output += "\n    </p>\n\n</div>\n\n\n\n<div class=\"show-for-large\" data-livefg>\n    <!-- playlist related -->\n    <dl>\n        <dt>Playlist</dt>\n        <dd>\n            <a target=\"_blank\" data-ct=\"playlist\" data-livefg\n               href=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"content_object")),"absolute_url"), env.opts.autoescape);
output += "\"\n               title=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"content_object")),"name"), env.opts.autoescape);
output += "\">\n                ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"content_object")),"name"),32), env.opts.autoescape);
output += "&nbsp;\n            </a>\n        </dd>\n\n        <dt>by</dt>\n        <dd>\n            <a target=\"_blank\" data-ct=\"author\" data-livefg\n               href=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"user_co")),"absolute_url"), env.opts.autoescape);
output += "\">\n\n\n                ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"user_co")),"display_name"),32), env.opts.autoescape);
output += "\n                <!--\n                ";
if(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"user_co")),"full_name")) {
output += "\n                    ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"user_co")),"full_name"),32), env.opts.autoescape);
output += " (";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"user_co")),"username"), env.opts.autoescape);
output += ")\n                ";
;
}
else {
output += "\n                    ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"emission")),"user_co")),"username"), env.opts.autoescape);
output += "\n                ";
;
}
output += "\n                -->\n                &nbsp;\n            </a>\n        </dd>\n\n        <dt>Airtime</dt>\n        <dd>\n            <span>";
output += runtime.suppressValue(env.getFilter("format_datetime").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"time_start"),"time_s"), env.opts.autoescape);
output += "</span>\n            ";
if(!runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"onair")) {
output += "\n            -\n            <span>";
output += runtime.suppressValue(env.getFilter("format_datetime").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"time_end"),"time_s"), env.opts.autoescape);
output += "</span>\n            ";
;
}
output += "\n        </dd>\n    </dl>\n\n    <div class=\"separator\" data-livefg></div>\n\n    <!-- track related -->\n    <dl>\n        <dt>Song</dt>\n        <dd>\n            <a target=\"_blank\" data-ct=\"media\" data-livefg\n               href=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"absolute_url"), env.opts.autoescape);
output += "\"\n               title=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"name"), env.opts.autoescape);
output += "\">\n                ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"name"),32), env.opts.autoescape);
output += "&nbsp;\n            </a>\n        </dd>\n\n        <dt>by</dt>\n        <dd>\n            <a target=\"_blank\" data-ct=\"artist\" data-livefg\n               href=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"artist")),"absolute_url"), env.opts.autoescape);
output += "\"\n               title=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"artist")),"name"), env.opts.autoescape);
output += "\">\n                ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"artist")),"name"),32), env.opts.autoescape);
output += "&nbsp;\n            </a>\n        </dd>\n\n        <dt>Release</dt>\n        <dd>\n            <a target=\"_blank\" data-ct=\"release\" data-livefg\n               href=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"release")),"absolute_url"), env.opts.autoescape);
output += "\"\n               title=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"release")),"name"), env.opts.autoescape);
output += "\">\n                ";
output += runtime.suppressValue(env.getFilter("truncate").call(context, runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"release")),"name"),22), env.opts.autoescape);
output += "\n                &nbsp;\n            </a>\n        </dd>\n\n        <dt>Label</dt>\n        <dd>\n            <a target=\"_blank\" data-ct=\"label\" data-livefg\n               href=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "base_url"), env.opts.autoescape);
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"label")),"absolute_url"), env.opts.autoescape);
output += "\">\n                ";
output += runtime.suppressValue(runtime.memberLookup((runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"label")),"name"), env.opts.autoescape);
output += "&nbsp;\n            </a>\n        </dd>\n\n    </dl>\n\n    <div class=\"separator\" data-livefg></div>\n\n    ";
var t_1;
t_1 = runtime.memberLookup((runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "object")),"item")),"relations");
frame.set("relations", t_1, true);
if(frame.topLevel) {
context.setVariable("relations", t_1);
}
if(frame.topLevel) {
context.addExport("relations", t_1);
}
output += "\n    <div class=\"relations\">\n        ";
if(runtime.contextOrFrameLookup(context, frame, "relations")) {
output += "\n        <ul class=\"no-bullet\">\n            ";
frame = frame.push();
var t_4 = runtime.contextOrFrameLookup(context, frame, "relations");
if(t_4) {var t_3 = t_4.length;
for(var t_2=0; t_2 < t_4.length; t_2++) {
var t_5 = t_4[t_2];
frame.set("relation", t_5);
frame.set("loop.index", t_2 + 1);
frame.set("loop.index0", t_2);
frame.set("loop.revindex", t_3 - t_2);
frame.set("loop.revindex0", t_3 - t_2 - 1);
frame.set("loop.first", t_2 === 0);
frame.set("loop.last", t_2 === t_3 - 1);
frame.set("loop.length", t_3);
output += "\n            <li>\n                <a target=\"_blank\" data-livefg href=\"";
output += runtime.suppressValue(runtime.memberLookup((t_5),"url"), env.opts.autoescape);
output += "\">\n                    ";
output += runtime.suppressValue(runtime.memberLookup((t_5),"name"), env.opts.autoescape);
output += "\n                </a>\n            ";
;
}
}
frame = frame.pop();
output += "\n        </ul>\n        ";
;
}
output += "\n    </div>\n\n\n</div>\n\n\n\n";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["onair/nj/rating.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<h1>---</h1>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();

(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["remotelink/nj/popup.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "<div>&nbsp;</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
