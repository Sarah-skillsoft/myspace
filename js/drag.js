
var totalDrags;
var currentTarget = "#target1";
var droppedOnTarget = false;
var distractorCount = 0;
var correctDragCount = 0;
var timerInterval;
var dragsPerTarget = 2;
var drag1Target1, drag2Target1, drag3Target1, drag4Target1, drag5Target1, drag6Target1, drag7Target1, drag8Target1;

var langObj = this[language.toLowerCase()];
var use508 = true;
var focusButton;
var currentClick;

var maxDragHeight = 0;

var userStarted = false;
var hasTimer = false;

var THIS = this;

var pageBackground;

// Empty the title if running in frame.
if(window.self !== window.top){
	$("title").empty();
}


if(typeof reusableDrags == "undefined"){
	reusableDrags = "";
}


// Give the required text vars empty values
var requiredText_array = ["questionText", "instructionText", "instructionText2", "instructionText3", "randomizeDrags", "targetIconColor", "timesUpFeedback", "finalAnswerFeedback"];
for(i=0; i<requiredText_array.length; i++){
	// Check to see if user defined a string
	if(typeof this[requiredText_array[i]] == "undefined"){
		// Check to see if it's a constant string
		if (langObj[requiredText_array[i]] != undefined){
			this[requiredText_array[i]] = langObj[requiredText_array[i]];
		}else{
			this[requiredText_array[i]] = "";
		}
		
	}
}


$(window).ready(function(){
	// Check to see if the user is viewing on a tablet.
	const userAgent = navigator.userAgent.toLowerCase();
	const isIpad = userAgent.indexOf("ipad") > -1;
	const isIphone = userAgent.indexOf("iphone") > -1;
	const isAndroid = userAgent.indexOf("android") > -1;
	
	if(isIpad || isIphone || isAndroid){
		$("#main").addClass("isTablet");
	}

	loadActivity();
	$("#main").css("visibility", "hidden");
	setTimeout(function(){
		resizeContent();
		$("#main").css("visibility", "visible");
	},200);
});



function loadActivity(){
	// RESET ALL INTERVALS
	clearTimeout(deleteToastInterval);
	clearTimeout(slideInToastInterval);
	clearTimeout(slideOutToastInterval);
	clearInterval(timerInterval);
	
	userStarted = false;
	maxDragHeight = 0;
	
	$("#main").empty().append("<div id='content'></div>");;
	$("#main").addClass("drag_many_to_many");
	$("#main").addClass("lang-"+language);
	if(this.discoveryMode == "true"){
		$("#main").addClass("discoveryMode");
	}
	
	$("#questionAudio").remove();
	// HEADER
	createHeader();	
	// CONTENT
	$("#content").append("<div id='interactiveContent'></div>");
	createTargets();
	createDrags();
	
	// Add the page background
	// for(i=1; i<=$(".target").length; i++){
		 if(this.backgroundImage){
			 pageBackground = backgroundImage;
		 }
	 // }
	 $("#pageBackground").remove();
	 if(pageBackground){
		$("body").prepend("<div id='pageBackground'></div>")
		$("#pageBackground").css("background-image","url('"+pageBackground+"')");
		$("#main").prepend("<div id='mainBackground'/>")
		$("#mainBackground").css("background-image", "url('"+pageBackground+"')");
	 }
	 
	
	// FOOTER
	createFooter();
	
	if(use508 && this.pageStyle != "style2"){
		// Keyboard Instructions Button
		$("#questionText").addClass("hasKeyboard");
		$("#header").append("<button class='keyboardButton' aria-label='"+langObj.keyboardButton+"' tabindex='0'></button>");
		
		$(".keyboardButton").append("<div id='keyboardIcon'></div>");
		$(".keyboardButton").append("<div id='keyboardText'>"+langObj.keyboardButton+"</div>");
		$(".keyboardButton").click(function(){
			// showFeedback(langObj.keyboardButton, langObj.keyboardInstructions, "#"+$(this).attr("id"));
			showFeedback(langObj.keyboardButton, langObj.keyboardInstructions, ".keyboardButton");
		});
		
		setTimeout(function(){
			$(".keyboardButton").outerHeight($("#header").outerHeight());
		}, 500);
		
		
	}else{
		//Timer
		if(typeof timeLimit != "undefined" && timeLimit != "0"){
			createTimer();
		}else{
			setTimeout(function(){
				setFocus("#questionText");
			}, 500);
		}
	}
	
	// Adjust the poppup links.
	var popupCount = 0;
	$("a").each(function(){
		var link = $(this).attr("href");
		if(link && link.indexOf("javascript:popup") != -1){
			popupCount++;
			$(this).attr("id", "popupLink"+popupCount);
			$(this).attr("href", link.split(")").join(",\"#"+ "popupLink"+popupCount+"\")"));
			
			// Replace the popup <a> tag with a <button>
			var id = $(this).attr("id");
			var href = $(this).attr("href");
			var self = $(this);
			self.replaceWith("<button id='"+id+"' class='hyperlinkButton' onclick='"+href.replace("javascript:","")+"'>"+self.html() + "</button>");
		}
	});
	
	$('.hyperlinkButton').each(function() {
        // Get the button's text
        let buttonText = $(this).text();
        // Check if the button text ends with a space
        if (buttonText.endsWith(' ')) {
            // Remove the trailing space from the button text
            $(this).text(buttonText.slice(0, -1));
            // Add the space after the button
            $(this).after(' ');
        }
    });
	
	// Browser support is only Chrome/Firefox so first let's check that.
	if (window.ResizeObserver) {
		// console.log("RESIZE OBSERVER ALLOWED");
		var observedElement = document.getElementById('text_div');
		var observedElement2 = document.getElementById('drags');
		
		var resizeAllowed = true;
		const observer = new ResizeObserver(entries => {
			// an array-like of ResizeObserverEntry
			for (const entry of entries) {
				if(resizeAllowed){
					// console.log("RESIZED");
					// resizeImage();
					resizeContent();
					resizeAllowed = false;
					setTimeout(function(){resizeAllowed = true}, 100);
				}
				
			}
		})
		observer.observe(observedElement);
	}
	
	setTimeout(function(){
		// Users not forced to listen to audio OR click on all options - MARK COMPLETED
		if(this.forceContentVisitation != "true"){
			enableNext();
			markCompleted();
		}
	}, 1000);	
	
	// ADJUST LAYOUT CORRECTLY FOR SCREEN SIZE.
	resizeContent();
}

// HEADER
function createHeader(){
	
	$("#content").append("<div id='header'></div>");
	// $("#header").append("<button disabled id='qIcon-border'><div id='qIcon'/></button>");
	$("#header").append("<button id='playPauseButton'><div id='playPauseIcon'/><div id='playPauseLabel'>"+langObj.audioButton+"</div></button>");
	$("#header").append("<h3 id='questionText' tabindex='-1'>"+questionText.split("<p>").join("<span>").split("</p>").join("</span>")+"</h3>");
	$("#questionText").append("<a aria-hidden='true'></a>");

	$("#playPauseButton").click(function(){
		// $("#questionAudio")[0].play();
		playPauseAudio();
	});

	if(this.pageStyle == "style2"){
		$("#header").prepend("<div id='text_div'></div>");
		$("#text_div").prepend($("#questionText"));
		$("#qIcon-border").insertAfter($("#header"));
	}
	$("#text_div").prepend($("#playPauseButton"));
	
	// AUDIO
	if(typeof this["audioFile"] != "undefined"){
		$("body").prepend("<audio id='questionAudio' onended='audioEnded()'><source src='"+audioFile+"' type='audio/mpeg'></audio>");
		setAudioVolume();
		$("#qIcon").addClass("animateQIcon");
		$("#qIcon-border").append("<div class='audioIcon animateAudioIcon'></div>");
		$("#qIcon-border").attr("tool-tip",langObj.audioButton);
		$("#qIcon-border").attr("aria-label",langObj.audioButton);
		
		$("#qIcon-border").removeAttr("disabled");
		$("#qIcon-border").click(function(){
			// $("#questionAudio")[0].play();
			playPauseAudio();
		});
		
		$("#qIcon-border").mouseleave(function() {
			$("#qIcon-border").blur();
		});
	}else{
		$("#playPauseButton").hide();
	}
}

function playPauseAudio(){
	if(!$("#playPauseButton").hasClass("pause")){
		$("#playPauseButton").removeClass("play");
		$("#playPauseButton").addClass("pause");
		$("#questionAudio")[0].play();
		$("#playPauseLabel").empty().append(langObj.pauseButton);
		
	}else{
		$("#playPauseButton").removeClass("pause");
		$("#playPauseButton").addClass("play");
		$("#questionAudio")[0].pause();
		$("#playPauseLabel").empty().append(langObj.audioButton);
	}
}

function audioEnded(){
	$("#playPauseButton").removeClass("pause");
	$("#playPauseButton").addClass("play");
	$("#playPauseLabel").empty().append(langObj.audioButton);
}

// Retrieve the volume level previously set in the RIA player and apply it to the interactive audio.
function setAudioVolume(){
	try{
		var RIA_Volume = window.parent.RIA_Player.media.SSMedia.videoVolume;
		// console.log("RIA VOLUME: "+ RIA_Volume);
		$("audio").prop("volume", RIA_Volume);
	}catch(err){
		// console.log("RIA NOT FOUND!");
	}
}

// TARGETS
function createTargets(){
	// Targets
	$("#interactiveContent").append("<div id='targets' class='container' aria-label='"+langObj.answersList+"' role='region' ><div class='hiddenText'>"+langObj.answersList+"</div><ul id='targetList' tabindex='-1'></ul></div>");
	for(i=1; (typeof this["target"+i+"Image"] != "undefined") || (typeof this["target"+i+"Label"] != "undefined") || (typeof this["target"+i+"AltText"] != "undefined"); i++){
		$("#targetList").append("<li class='targetLI'><div class='target activeTarget' id='target"+i+"' tabindex='-1' targetNum='"+i+"'><div class='target_background'></div></div></li>");
		if(typeof this["target"+i+"Image"] != "undefined"){
			$("#target"+i).children(".target_background").css("background-image", "url('"+eval("target"+i+"Image")+"')");
		}
		$("#target"+i).append("<div class='targetIcon targetIcon-"+target1IconColor+"'></div>");
		$("#target"+i).append("<ul class='dropZone' tabindex='-1'></ul>");
		
		var label = "";
		//Labels
		if(typeof this["target"+i+"Label"] != "undefined"){
			$("#target"+i).append("<div class='targetLabel' tabindex='-1' aria-hidden='true'>"+this["target"+i+"Label"]+"</div>");
			$("#target"+i).children(".dropZone").addClass("dropZoneTop");
			$("#target"+i).children(".dropZone").insertAfter($("#target"+i).children(".targetLabel"));
			// $("#target"+i).attr("aria-label",stripHTML(this["target"+i+"Label"]));
			label = stripHTML(this["target"+i+"Label"]);
		}
		// Alt Text
		if(typeof this["target"+i+"AltText"] != "undefined"){
			// $("#target"+i).attr("aria-label",stripHTML(this["target"+i+"AltText"]));
			label = stripHTML(this["target"+i+"AltText"]);
		}
		$("#target"+i).prepend("<div class='hiddenText'>"+label+"</div>");
	}
	var totalTargets = $(".target").length;
	$(".targetLI").addClass("targets"+totalTargets);
	
	$( ".target" ).droppable({
	  accept: ".drag",
	  drop: function(event, ui) {
			try{
				$( ".drag" ).draggable( "option", "revertDuration", 1 );
			}catch (e){
			}
			droppedOnTarget = true;
			currentTarget = $(this).attr("targetNum");
	  },
	});
	if(typeof randomizeTargets != "undefined"){ 
		if(randomizeTargets.toString().toLowerCase() == "true"){
			shuffleElements( $('.targetLI') );
		}
	}
	if($(".target").length < 3){
		dragsPerTarget = 4;
		this.target1Drags = 0;
		this.target2Drags = 0;
		for(i=1; this["drag"+i+"Target"]; i++){
			var targetNum = this["drag"+i+"Target"];
			this["target"+targetNum+"Drags"]++;
		}
		if(this.target1Drags == 5 || this.target2Drags == 5){
			dragsPerTarget = 5;
		}
	}
	// Set all elements in the targetLabel to aria-hidden
	$(".targetLabel").children("p").attr("aria-hidden", "true");
}


// DRAGS
function createDrags(){
	// Drags
	$("#interactiveContent").append("<div id='drags' class='container'></div>");
	$("#drags").append("<div class='bannerText' tabindex='-1'>"+instructionText+"</div>");
	
	if(this.pageStyle == "style2"){
		$(".bannerText").insertAfter("#questionText");
	}
	
	$("#drags").append("<div id='optionsList' aria-label='"+langObj.optionsList+"' role='region' tabindex='-1'><div class='hiddenText'>"+langObj.optionsList+"</div><ul id='dragList'></ul></div>");
	
	var correctTargets = []; 
	
	
	for(i=1; (typeof this["drag"+i] != "undefined" || typeof this["drag"+i+"Image"] != "undefined"); i++){
		$("#dragList").append("<li class='dragLI'><div class='drag' id='drag"+i+"' dragNum='"+i+"' role='button' tabindex='0'><div class='dragHandle'/></div></li>");

		if(typeof(this["drag"+i+"Target"]) == "undefined"){
			this["drag"+i+"Target"] = "";
			distractorCount++;
		}else{
			this["drag"+i+"Target1"] = this["drag"+i+"Target"];
		}
		
		var label = "";
		
		// Check for image
		if(typeof this["drag"+i+"Image"] != "undefined"){
			$("#drag"+i).css("background-image", "none");
			$("#drag"+i).prepend("<div class='drag_background'></div>");
			$("#drag"+i).children(".drag_background").css("background-image", "url('"+this["drag"+i+"Image"]+"')");
			$("#drag"+i).parent().addClass("dragImage");
			if(this["drag"+i+"Image"].indexOf(".svg") != -1){
				// $("#drag"+i).addClass("svg");
			}
			// Check for ALT TEXT
			if(typeof this["drag"+i+"AltText"] != "undefined"){
				$("#drag"+i).attr("dragAlt", stripHTML(this["drag"+i+"AltText"]));
				// $("#drag"+i).attr("aria-label", stripHTML(this["drag"+i+"AltText"]));
				label = stripHTML(this["drag"+i+"AltText"]);
			}
		}
		
		
		
		
		// Check for label
		if(typeof this["drag"+i] == "string"){
			$("#drag"+i).attr("dragLabel", stripHTML(this["drag"+i]));
			$("#drag"+i).append("<div class='dragLabel' aria-hidden='true'>"+this["drag"+i]+"</div>");
			// $("#drag"+i).attr("aria-label", stripHTML(this["drag"+i]));
			label = stripHTML(this["drag"+i]);
			var label_div = $("#drag"+i).children(".dragLabel")[0];
		}
		
		$("#drag"+i).prepend("<div class='hiddenText'>"+label+"</div>");
		
		
		
		
		// Add the Correct Target to correctTargets 
		if(this["drag"+i+"Target"]){
			correctTargets.push(this["drag"+i+"Target"]);
		}
		
	}
	
	// Set all elements in the targetLabel to aria-hidden
	$(".dragLabel").children("p").attr("aria-hidden", "true");
	
	// console.log("CORRECT TARGETS: " + correctTargets);
	// console.log("DUPLICATES: " + checkIfDuplicateExists(correctTargets));
	
	// Check for duplicate targets.
	if(!checkIfDuplicateExists(correctTargets) && this.reusableDrags != "true"){
		dragsPerTarget = 1;
		$(".drag").addClass("noDupTargets");
	}
	
	
	if($(".dragImage").length > 0){
		$(".dragLI").addClass("dragImage");
		$(".drag").removeClass("noDupTargets");
	}
	
	totalDrags=$(".drag").length; 
	
	// Adjust width of drags according to the total number.
	if(totalDrags < 5){
		// 1 - 4 Drags
		$(".dragLI").addClass("drags1-4");
	}else if (totalDrags > 6){
		// 7 - 8 Drags
		$(".dragLI").addClass("drags7-8");
		$(".dragLI").removeClass("dragImage");
		$(".drag_background").remove();
		
		$("#drags").addClass("width50");
		$("#targets").addClass("width50");
		
	}else{
		// 5 - 6 Drags
		$(".dragLI").addClass("drags5-6");
	}
	
	$( ".drag" ).draggable({
		distance: 10,
		revert: true,
		revertDuration: 500,
		stack: ".target",
		zIndex: 1000,
		scroll: false,
		containment: "#main",
		start: function( event, ui ) {
			$(this).addClass("dragging");
			// $("#interactiveContent").addClass("draggingContent");
			if(hasTimer & !userStarted & !$("#timer").hasClass("timerDisabled")){
				$("#alertFeedback").empty().append(langObj.timerStarted);
				setTimeout(function(){
					$("#alertFeedback").empty();
				}, 500);
			}
			userStarted = true;
			try{
				if($("#main").width() <= 600 && THIS.pageStyle == "style2"){
					$("#dragOptionsFade").remove();
					$("#dragList").children(".dragLI").css("visibility", "hidden");
					$(this).parent().css("visibility", "visible")
					$("#mobileDragsBackground").css("visibility", "hidden");
					$( ".drag" ).draggable( "option", "revertDuration", 0 );
				}
			}catch(e){
				
			}
		},
		stop: function( event, ui ) {
			$(this).removeClass("dragging");
			// $("#interactiveContent").removeClass("draggingContent");
			if(droppedOnTarget == true){
				drop($(this));
			}
			if($("#main").width() <= 600 && THIS.pageStyle == "style2"){
				$(".dragLI").css("visibility", "visible");
				$("#mobileDragsBackground").css("visibility", "visible");
				$("#drags").hide();
				if($("#dragList").children(".dragLI").length == 0){
					// $("#dragOptions").remove();
					$("#dragOptions").css("visibility", "hidden");
				}
			}
		}
	});
	
	if(!reusableDrags){
		$( ".drag" ).draggable( "option", "revert", "invalid" );
	}

	if(use508){
		$(".drag").click(function(){
			selectDrag($(this));
		});
		$( ".drag" ).keyup(function(e) {
			if(e.key == " " || e.key == "Enter" || e.keyCode == 32 || e.keyCode == 13){			
				selectDrag($(this));
			}
		});
	}
	if(typeof randomizeDrags != "undefined"){
		if(randomizeDrags.toString().toLowerCase() == "true"){
			shuffleElements( $('.dragLI') );
		}
	}
	
	setTimeout(function(){
		// resizeDrags();
	}, 100);
}

function resizeDrags(){
	// maxDragHeight = 0;
	if(maxDragHeight == 0 && $(".noDupTargets").length > 0){
		$(".dragLabel").each(function(){
			if($(this).height() > maxDragHeight){
				maxDragHeight = $(this).height();
			}
		});
		$(".noDupTargets").height(maxDragHeight + 10);
	}
	// Dropped drags
	if($("#main").width()<=600){
			$(".target").find(".noDupTargets").height(maxDragHeight + 10);
	}else{
			$(".target").find(".noDupTargets").height(maxDragHeight + 40);
	}
}

function checkIfDuplicateExists(arr) {
    return new Set(arr).size !== arr.length
}



function selectDrag(item){
	
	if(use508 && $("#main").width() > 600 && !$(item).hasClass("dragSelected")){
		// var dragName = $(item).children(".dragLabel").text();
		if($(item).attr("dragLabel")){
			var dragName = $(item).attr("dragLabel");
		}else if($(item).attr("dragAlt")){
			var dragName = $(item).attr("dragAlt");
		}
		
		
		if(hasTimer & !userStarted & !$("#timer").hasClass("timerDisabled")){
			$("#hiddenFeedback").empty().append(langObj.timerStarted);
			setTimeout(function(){
				$("#hiddenFeedback").empty();
			}, 500);
		}else{
			$("#hiddenFeedback").empty();
		}
		userStarted = true;
		
		$("#hiddenFeedback").removeAttr("aria-live");
		$("#hiddenFeedback").append(langObj.optionSelected.replace("#DRAGNAME", dragName));
		setFocus("#hiddenFeedback");
		setTimeout(function(){
			$("#hiddenFeedback").attr("aria-live","assertive");
			setTimeout(function(){
				$("#hiddenFeedback").empty();
			}, 500);
		},100);
		
		//
		$("#targetList").prepend("<div class='focusTrap' aria-hidden='true' tabindex='0'></div>");
		$("#targetList").append("<div class='focusTrap' aria-hidden='true' tabindex='0'></div>");
		$(".activeTarget").click(function(){
			currentTarget = $(this).attr("targetNum");
			drop($(currentDrag), $(this));	
			setTimeout(function(){
				// console.log($("#dragList").children().length);
				if($(".activeTarget").length > 0 && $("#dragList").children().length > 0){
					setFocus($(".drag:not('.dropped')").first());
				}else{
					setFocus($("#submitButton"));
				}
				
			},1000);
		});
		$(".target:not('.activeTarget')").click(function(){
			drop();
		});
		$( ".activeTarget" ).keyup(function(e) {
			if(e.key == " " || e.key == "Enter" || e.keyCode == 32 || e.keyCode == 13){
				currentTarget = $(this).attr("targetNum");
				drop($(currentDrag), $(this));	
				setTimeout(function(){
					// console.log($("#dragList").children().length);
					if($(".activeTarget").length > 0  && $("#dragList").children().length > 0){
						setFocus($(".drag:not('.dropped')").first());
					}else{
						setFocus($("#submitButton"));
					}
				},1000);
			}
		});
		
		$( ".focusTrap").first().keyup(function(e){
			if (e.key == "Tab" && e.shiftKey) {
				e.preventDefault();
				setFocus($( ".activeTarget" ).last());
				
			}
		});
		
		$( ".focusTrap").last().keyup(function(e){
			if (e.key == "Tab") {
				e.preventDefault();
				setFocus($( ".activeTarget" ).first());
			}
		});
		//
		currentDrag = $(item);
		currentDragNum = $(item).attr("dragNum");
		$(".drag").removeClass("dragSelected"); 
		$(item).addClass("dragSelected"); 
		$(".drag").removeAttr("tabindex");
		$(".activeTarget").attr("role","button");
		$(".activeTarget").attr("tabindex","0");
		
		setTimeout(function(){
			setFocus($(".activeTarget").first());
		}, 1000);
		
		$(".target").addClass("targetGray");
		$("#main").append("<div id='fade'></div>");
		setTimeout(function(){
			$("#fade").addClass("fadeAnimation");
		}, 5);
		$("#targets").addClass("targetsSelected");
		
		$("#qIcon-border").attr("tabindex", "-1");
		$("#resetButton").attr("tabindex", "-1");
		$("#submitButton").attr("tabindex", "-1");
		$(".keyboardButton").attr("tabindex", "-1");
		
		$("a").attr("tabindex", "-1");
		$("#timer").attr("tabindex", "-1");
	}
}

// FOOTER
function createFooter(){
	$("#content").append("<div id='footer'></div>");
	
	if(this.pageStyle == "style2"){
		// $("#submitButton").insertBefore("#resetButton");
		
		// $("#footer").append("<button class='keyboardButton' aria-label='"+langObj.keyboardButton+"' tabindex='0'>"+langObj.keyboardButton+"</button>");
		$("#footer").append("<div id='keyboardDiv'><button class='keyboardButton' aria-label='"+langObj.keyboardButton+"' tabindex='0'>"+langObj.keyboardButton+"</button><div>");
		$("#keyboardDiv").insertAfter($("#header"));
		
		$(".keyboardButton").prepend("<div id='keyboardIcon'></div>");
		$(".keyboardButton").click(function(){
			// showFeedback(langObj.keyboardButton, langObj.keyboardInstructions, "#"+$(this).attr("id"));
			showFeedback(langObj.keyboardButton, langObj.keyboardInstructions, ".keyboardButton");
		});
		$(".keyboardButton").outerHeight($("#header").outerHeight());
	}
	
	$("#footer").append("<div id='checkmark'></div><div id='instructionText2' aria-live='polite' tabindex='-1'>"+instructionText2+"</div>");
	$("#footer").append("<div id='bottomButtons'><button id='resetButton' class='bottomButton' onclick='reset()'  tabindex='0'>"+langObj.resetButton+"</button><button id='submitButton' class='bottomButton' onclick='submit()' tabindex='0'>"+langObj.submitButton+"</button></div>");
	
	
	
	if(canGoFullScreen()){
		// $("#footer").append("<button id='fullscreen' title='"+langObj.fullscreenButton+"' aria-label='"+langObj.fullscreenButton+"' class='expand' onclick='toggleFullScreen()' tabindex='0'></button>");
	}
	$("#footer").append("<p id='alertFeedback' class='hiddenText' aria-live='assertive' role='alert'></p>");
	$("#footer").append("<p id='hiddenFeedback' class='hiddenText' aria-live='assertive' tabindex='-1'></p>");
	
}

function createTimer(){
	hasTimer = true;
	var seconds;
	if(typeof(timeUnits) == "undefined" || timeUnits == "minutes"){
		seconds = Number(timeLimit) * 60;
	}else{
		seconds = Number(timeLimit);
	}
	if(this.pageStyle == "style2"){
		$("#header").append("<button id='timer' tool-tip='"+langObj.timerButton+"' aria-label='"+langObj.timerButton+"'></button>");
		$("#timer").append("<div class='timerRight'></div>");
		$("#timer").append("<div class='timerLeft'></div>");
		$("#timer").append("<div class='timerMask'></div>");
		$("#timer").attr("tabindex","0");
		$("#timer").insertBefore($("#qIcon-border"));
		$(".bannerText").addClass("hasTimer");
	}else{
		$("#header").append("<div id='timer' aria-hidden='true'></div>");
	}
	
	$("#timer").append("<div id='timerIcon'></div>");
	$("#timer").append("<div id='timerText'>"+convertSeconds(seconds)+"</div>");
	
	$("#questionText").addClass("hasTimer");
	
	if(this.pageStyle == "style2"){
		$("#timer").attr("onclick", "stopTimer()");

		var timerWarning = langObj.timerWarning.split("#TIMELIMIT").join(seconds);
		showFeedback(langObj.timerWarningTitle, timerWarning, "#questionText");
		$("#feedbackBox").attr("role", "region");
		$("#feedbackBox").removeAttr("aria-modal");
		$("#feedbackBox").removeAttr("aria-describedby");
		
		$("#closeFeedback").attr("onclick", "startTimer("+seconds+")");
		
		$("#closeFeedback").hide();
		
		$("#feedbackBox").append("<div id='timerBoxButtons' role='navigation'><button id='continue' class='bottomButton'>"+langObj.continueButton+"</button><button id='removeTimeLimit' class='bottomButton' onclick='stopTimer()'>"+langObj.removeTimeLimit+"</button></div>");
		$("#continue").attr("onclick", "startTimer("+seconds+")");
		$("#feedbackBox").addClass("timerBox");
		$("#timerBoxButtons").insertAfter("#feedbackText");
		
		$(".focusTrap").last().insertAfter("#feedbackBox");
		$(".focusTrap").first().insertBefore("#feedbackBox");
		$(".focusTrap").off();
		
		$( ".focusTrap").first().keyup(function(e){
			if (e.shiftKey && e.key == "Tab") {
				e.preventDefault();
				setFocus($("#removeTimeLimit"));
			}else if (e.key == "Tab") {
				e.preventDefault();
				setFocus($("#continue"));
			}
		});
		
		$( ".focusTrap").last().keyup(function(e){
			if (e.key == "Tab") {
				e.preventDefault();
				setFocus($("#continue"));
			}
		});
		
		$(".focusTrap").remove();

		setTimeout(function(){
			// $("#closeFeedback").focus();
			$("#continue").focus();
		},500);
		
	}else{
		userStarted = true;
		startTimer(seconds);
	}
}

function startTimer(seconds){
	closeFeedback();
	var totalSeconds = seconds;
	var fifteenSecondWarning = false;
	var thirtySecondWarning = false;
	if(!$("#timer").hasClass("timerDisabled")){
		timerInterval = setInterval(function() {
			if(userStarted){
				seconds--;
			}
			
			// TIME IS RUNNING OUT
			if(seconds <= 15){
				$("#timer").addClass("runningOutOfTime");
				if(this.pageStyle == "style2" & fifteenSecondWarning == false){
					$("#alertFeedback").empty().append(langObj.secondsRemaining.split("#TIMELIMIT").join("15"));
					setTimeout(function(){
						$("#alertFeedback").empty();
					}, 500);
					fifteenSecondWarning = true;
				}
			}
			
			if(seconds == 30){
				if(this.pageStyle == "style2" & thirtySecondWarning == false & totalSeconds >= 60){
					$("#alertFeedback").empty().append(langObj.secondsRemaining.split("#TIMELIMIT").join("30"));
					setTimeout(function(){
						$("#alertFeedback").empty();
					}, 500);
					thirtySecondWarning = true;
				}
			}
			// TIME'S UP
			if (seconds <= 0) {	
				if(this.pageStyle == "style2"){
					$("#timerText").empty().append("0");
					$(".timerLeft").hide();
					$(".timerRight").hide();
				}else{
					$("#timerText").empty().append("0:00");
					
				}
				timesUp();
			}
			if(this.pageStyle == "style2"){
				$("#timerText").empty().append(seconds);
				var percentLeft = (seconds/totalSeconds);
				var rotation = (360 * percentLeft)-360;

				if(rotation > -180){
					$(".timerLeft").css("transform", "rotate("+rotation+"deg)");
				}else{
					$(".timerLeft").css("transform", "rotate(0deg)");
					$(".timerLeft").css("background-color", "#e1e1e1");
					$(".timerLeft").css("box-shadow", "-1px 0px 0px 1px white");
					$(".timerRight").css("transform", "rotate("+(rotation+180)+"deg)");
				}
			}else{
				$("#timerText").empty().append(convertSeconds(seconds));
			}
		}, 1000);
		if(this.pageStyle == "style2"){
			// playPauseAudio();
		}
	}
}

function stopTimer(){
	clearInterval(timerInterval);
	$("#alertFeedback").empty().append(langObj.timerStopped);
	setTimeout(function(){
		$("#alertFeedback").empty();
	}, 500);
	$("#timer").addClass("timerDisabled");
	// $("#timer").blur();
	$("#timer").attr("tabindex","-1");
	// $("#timer").attr("disabled","true");
	$("#timer").removeAttr("tool-tip");
	$("#timer").removeAttr("onclick");
	if($("#feedbackBox").length){
		closeFeedback();
	}
}

// Time's Up!
function timesUp(){
	$(".drag").removeClass("dragSelected");
	$(".drag").attr("tabindex","-1");
	$(".target").attr("tabindex","-1");
	submit();
	// Add the Time's Up message to the question feedback
	$(".toast").prepend(langObj.timesUpFeedback);
	$(".toast-icon").css("background-image", "url(images/stopwatch.svg)");
	// $("#feedbackText").prepend(langObj.timesUpFeedback);
	$("#feedbackTitle").empty().append(langObj.timesUpFeedback);
	
	if($("#main").width() <= 600 && THIS.pageStyle == "style2"){
		hideDragOptions();
	}
}

// Convert the seconds remaining into minutes:seconds format.
function convertSeconds(seconds){
	var display_minutes = Math.floor(seconds/60);
	var display_seconds = seconds - (60*display_minutes);
	if(display_seconds<10){
		display_seconds = "0"+display_seconds;
	}
	return(display_minutes + ":" + display_seconds);
}

// Drop the item on a target element.
function drop(item){
	$( ".focusTrap").remove();
	var drag = $(item);
	
	var target = $("#target"+currentTarget);
	if($(target).children(".dropZone").has("#"+$(item).attr("id")).length < 1){
		// var dragName = $(item).children(".dragLabel").text();
		// var dragName = $(item).attr("dragLabel");
		
		var dragName = "";
		if($(item).attr("dragAlt")){
			dragName = $(item).attr("dragAlt");
		}
		if($(item).attr("dragLabel")){
			dragName = $(item).attr("dragLabel");
		}
		
		// var targetName = $("#target"+currentTarget).attr("aria-label");
		var targetName = $("#target"+currentTarget).children(".hiddenText").text();
		
		$("#hiddenFeedback").removeAttr("aria-live");
		$("#hiddenFeedback").empty().append(langObj.movedToTarget.split("#DRAGNAME").join(dragName).split("#TARGETNAME").join(targetName));
		// console.log(langObj.movedToTarget.split("#DRAGNAME").join(dragName).split("#TARGETNAME").join(targetName));
		setFocus("#hiddenFeedback");
		setTimeout(function(){
			$("#hiddenFeedback").attr("aria-live","assertive");
			setTimeout(function(){
				$("#hiddenFeedback").empty();
			}, 500);
		},100);
		
		
		
		droppedOnTarget = false;
		
		if(reusableDrags){
			$(item).parent().clone().appendTo($(target).children(".dropZone")).children(".drag").addClass("dropped");
			drag = $(target).children(".dropZone").children(".dragLI").children(".drag");
		}else{
			$(item).parent().appendTo($("#target"+currentTarget).children(".dropZone"));
		}
		
		$(drag).removeAttr("style");
		$(drag).removeAttr("role");
		// $(drag).removeAttr("tabindex");
		$(drag).attr("tabindex", "-1");
		// $(drag).attr("role","listItem");
		try{
			$(drag).draggable( "disable" );
		}catch(e){
			
		}
		$(drag).addClass("dropped");
		$(".drag").blur();
		$(".drag").removeClass("dragSelected");
		$(drag).css("cursor", "default");
		$(drag).off("click");
		$(drag).off("keyup");
		// $(drag).attr("aria-disabled", "true");
		$(drag).attr("aria-hidden", "true");
		$(drag).attr("targetNum", currentTarget);

		// Allow up to 2 drags/target 
		if($("#target"+currentTarget).children(".dropZone").children().length == dragsPerTarget){
			$("#target"+currentTarget).droppable( "disable" );
			// $("#target"+currentTarget).children(".targetIcon").remove();
			$("#target"+currentTarget).removeClass("activeTarget");
		}
		
		$(".target").removeClass("targetGray");
		$(".target").attr("tabindex","-1");
		$(".target").removeAttr("role");
		$(".drag:not('.dropped')").attr("tabindex", "0");
		$(".target").off("click");
		$(".target").off("keyup");
		$("#targets").removeClass("targetsSelected");
		
		$("#fade").removeClass("fadeAnimation");
		setTimeout(function(){
			$("#fade").remove();
		},250);

		$("#resetButton").attr("tabindex", "0");
		$("#submitButton").attr("tabindex", "0");
		$(".keyboardButton").attr("tabindex", "0");
		
		$("a").removeAttr("tabindex");
		if(!$("#timer").hasClass("timerDisabled")){
			$("#timer").removeAttr("tabindex");
		}
		
		if($(".activeTarget").length == 0){
			disableDrags();
		}
		// resizeDrags();
		alignDrags();
		
	}
}

// Shuffle the elements
function shuffleElements($elements) {
	var i, index1, index2, temp_val;
	var count = $elements.length;
	var $parent = $elements.parent();
	var shuffled_array = [];
	// populate array of indexes
	for (i = 0; i < count; i++) {
		shuffled_array.push(i);
	}
	// shuffle indexes
	for (i = 0; i < count; i++) {
		index1 = (Math.random() * count) | 0;
		index2 = (Math.random() * count) | 0;

		temp_val = shuffled_array[index1];
		shuffled_array[index1] = shuffled_array[index2];
		shuffled_array[index2] = temp_val;
	}
	// apply random order to elements
	$elements.detach();
	for (i = 0; i < count; i++) {
		$parent.append( $elements.eq(shuffled_array[i]) );
	}
}


function submit(){
	// $("#dragOptions").remove();
	// Stop the timer
	clearInterval(timerInterval);
	if(this.pageStyle == "style2"){
		$("#timer").addClass("timerDisabled");
		$("#timer").blur();
		$("#timer").attr("tabindex","-1");
		$("#timer").attr("disabled","true");
		$("#timer").removeAttr("tool-tip");
		$("#timer").removeAttr("onclick");
		// closeFeedback();
		$("#fade").remove();
		$("#feebbackBox").remove();
	}
	
	$(".drag").removeAttr("aria-hidden");
	
	if($("#submitButton").hasClass("finalAnswer")){
		// FINAL ANSWER
		finalAnswer();
	}else{
		//SUBMIT
		disableDrags();
		disableTargets();
		$(".drag").addClass("finished");
		$(".target").removeAttr("tabindex");
		var totalCorrectDrags = 0;
		for(i=1; i<=totalDrags; i++){
			for(j=1; j<=4; j++){
				if(typeof THIS["drag"+i+"Target"+j] != "undefined"){
					if(THIS["drag"+i+"Target"+j] != ""){
						totalCorrectDrags++;
					}
				}
			}	
		}

		// Add correct class to correct drags
		$(".dropped").each(function(){
			var dragNum = $(this).attr("dragNum");
			for(i=1; i<=4; i++){
				if(typeof THIS["drag"+$(this).attr("dragNum")+"Target"+i] != "undefined"){
					if($(this).attr("targetNum") == eval("drag"+$(this).attr("dragNum")+"Target"+i)){
						$(this).addClass("correct");
					}
				}
			}
		});	
		
		$(".dropped:not(.correct)").addClass("incorrect");
		$(".dropped.drag").children(".dragHandle").remove();
		
		// Evaluate the dropped drag elements.
		var correctCount = $(".correct").length;
		var incorrectCount = $(".incorrect").length;
		
		// Add feedback icon to dropped elements
		$(".dropped").append("<div class='feedbackIcon'></div>");

		// Evaluate the user's results
		if(correctCount == totalCorrectDrags && incorrectCount == 0){
			correct();
		}else if(correctCount > 0){
			partCorrect();
		}else{
			incorrect();
		}

		$(".drag:not('.dropped')").removeClass("correct incorrect");
		
		$(".dropped").each(function(){
			// var dragName = $(this).children(".dragLabel").text();
			
			var dragName = "";
			if($(this).attr("dragAlt")){
				dragName = $(this).attr("dragAlt");
			}
			if($(this).attr("dragLabel")){
				dragName = $(this).attr("dragLabel");
			}
			
			// if($(this).text() != ""){
				// dragName = $(this).text();
			// }
			
			// console.log(dragName);
			if($(this).hasClass("correct")){
				//$(this).attr("aria-label", dragName + " " + langObj.correctLabel);
				// $(this).attr("aria-label", langObj.correctLabel + ". " + dragName);
				$(this).children(".hiddenText").empty().append(langObj.correctLabel + ". " + dragName);
			}else{
				//$(this).attr("aria-label", dragName + " " + langObj.incorrectLabel);
				// $(this).attr("aria-label", langObj.incorrectLabel + ". " + dragName);
				$(this).children(".hiddenText").empty().append(langObj.incorrectLabel + ". " + dragName);
			}
		});
		
		// Change the text on the RESET and SUBMIT buttons.
		$("#resetButton").empty().append(langObj.tryAgainButton);
		$("#submitButton").empty().append(langObj.finalAnswerButton).addClass("finalAnswer");
		$("#instructionText2").empty().append(instructionText3);
	}
	// $("#hiddenFeedback").empty();
	
	// Enable the RIA next button is required.
	if(this.forceContentVisitation == "true"){
		enableNext();
		markCompleted();
	}
	
	if(this.discoveryMode == "true"){
		finalAnswer();
		if(correctCount == totalCorrectDrags && incorrectCount == 0){
			correct();
		}else if(correctCount > 0){
			partCorrect();
		}else{
			incorrect();
		}
	}
}

function reset(){
	loadActivity();
	if(!$("#feedbackBox").length){
		setFocus($("#questionText"));
	}
}


function correct(){
	if(typeof(correctFeedback) == "undefined"){
		// createToast("correct");
		showFeedback(langObj.correctLabel, langObj.correctFeedback, "#submitButton");
	}else{
		showFeedback(langObj.correctLabel, correctFeedback, "#submitButton");
	}
}

function partCorrect(){
	if(typeof(partCorrectFeedback) == "undefined"){
		// createToast("partCorrect");
		showFeedback(langObj.partCorrectLabel, langObj.partCorrectFeedback, "#submitButton");
	}else{
		showFeedback(langObj.partCorrectLabel, partCorrectFeedback, "#submitButton");
	}
}

function incorrect(){
	// createToast("incorrect");
	if(typeof(incorrectFeedback) == "undefined"){
		// createToast("incorrect");
		showFeedback(langObj.incorrectLabel, langObj.incorrectFeedback, "#submitButton");
	}else{
		showFeedback(langObj.incorrectLabel, incorrectFeedback, "#submitButton");
	}
}

function finalAnswer(){
	// Scoring?
	// createToast("finalAnswer");
	disableDrags();
	showFeedback(langObj.finalAnswerButton, finalAnswerFeedback, "#"+$(".target").first().attr("id"));
	$(".feedbackIcon").remove();
	$("#instructionText2").empty().append(langObj.csfInstructions);
	$(".targetIcon").remove();
	
	if(reusableDrags){
		$(".dropZone").empty();
	}else{
		$("#dragList").append($(".dragLI"));
	}

	$(".drag").each(function(){
		var dragNum = $(this).attr("dragNum");
		for(i=1; i<=4; i++){
			if(typeof THIS["drag"+dragNum+"Target"+i] != "undefined"){
				if(reusableDrags){
					var targetNum = eval("drag"+dragNum+"Target" + i);
					$("#drag"+dragNum).parent().clone().appendTo($("#target"+targetNum).children(".dropZone"));
				}else{
					var targetNum = eval("drag"+dragNum+"Target1");
					$("#target"+targetNum).children(".dropZone").append($("#drag"+dragNum).parent());
				}
			}
			
		}
		
		var dragText = "";
		if($(this).attr("dragLabel")){
			dragText = $(this).attr("dragLabel");
		}
		if($(this).attr("dragAlt")){
			dragText = $(this).attr("dragAlt");
		}
		
		
		// var dragText = $(this).children(".dragLabel").text();
		// var feedback_str = eval($(this).attr("id") + "Feedback");
		
		// $(this).attr("aria-label", dragText);
		$(this).children(".hiddenText").empty().append(dragText);
		
		if(eval("drag"+dragNum+"Target")==""){
			// $(this).attr("aria-label", dragText + " " + langObj.incorrectLabel);
			// $(this).attr("aria-label", langObj.incorrectLabel + " " + dragText);
			$(this).children(".hiddenText").empty().append(langObj.incorrectLabel + ". " + dragText);
		}else{
			// $(this).attr("aria-label", dragText + " " + langObj.correctLabel);	
			// $(this).attr("aria-label", langObj.correctLabel + " " + dragText);
			$(this).children(".hiddenText").empty().append(langObj.correctLabel + ". " + dragText);
			}
	});

	
	// $(".drag").attr("tabindex", "0");
	// $(".drag").attr("role", "button");
	$(".drag").attr("tabindex", "-1");
	$(".drag").removeAttr("role");
	
	$(".dragHandle").remove();
	$(".drag").removeClass("correct incorrect");
	$(".drag").addClass("finished");
	$("<div class='dragHandle'></div>").insertBefore(".dragLabel");
	
	$(".target").off("click");
	$(".target").off("keyup");
	
	// Targets
	$(".target").each(function(){
		// Check for feedback and make clickable if it exists.
		var id = $(this).attr("id");
		if(typeof(THIS[id + "Feedback"]) != "undefined"){
			var title_str = " ";
			if(THIS[id+"Label"]){
				title_str = THIS[id+"Label"];
			}else if(THIS[id+"AltText"]){
				title_str = THIS[id+"AltText"];
			}
		
			
			var feedback_str = eval(id + "Feedback");
			$(this).click(function(){
				showFeedback(title_str, feedback_str, "#"+id);
			});
			$(this).keydown(function(e) {
				if(e.key == " " || e.key == "Enter" || e.keyCode == 32 || e.keyCode == 13){			
					showFeedback(title_str, feedback_str, "#"+id);
					return false;
				}
			});
		}else{
			$(this).addClass("noFeedback");
		}
	});
	
	// $(".target").attr("tabindex", "0");
	$(".target").attr("role", "button");
	if(use508){
		$(".target").addClass("targetGray");
		// setFocus($(".target").first());
	}
	$(".target").addClass("targetFinished");
	$("#resetButton").remove();
	$("#submitButton").remove();
	$("#hiddenFeedback").empty();
	
	// resizeDrags();
}

function popup(popupNum,sender){
	var popupTitle = eval("popup"+popupNum+"Title");
	var popupText = eval("popup"+popupNum+"Text");
	showFeedback(popupTitle, popupText, sender);
}

function showFeedback(title_str, feedback_str, focusObj){
	focusButton = focusObj;
	clearTimeout(deleteToastInterval);
	clearTimeout(slideInToastInterval);
	clearTimeout(slideOutToastInterval);
	$(".toast").remove();
	
	$("#fade").remove();
	$("#feedbackBox").remove();

	$("#main").append("<div id='fade'></div>");
	// $("#main").append("<div id='feedbackBox' role='dialog' aria-modal='true' aria-describedby='feedbackTitle feedbackText'></div>");
	$("#main").append("<div id='feedbackBox' role='dialog' aria-modal='true' aria-labelledby='feedbackTitle' aria-describedby='feedbackText'></div>");

	$("#feedbackBox").addClass("popupTransition");
	setTimeout(function(){
		$("#fade").addClass("fadeAnimation");
		$("#feedbackBox").addClass("popupAnimation");
		// $(".fade").click(function(){
			// closeFeedback();
		// });
	}, 5);
	
	$("#feedbackBox").append("<div class='focusTrap' aria-hidden='true' tabindex='0'></div>");
	$("#feedbackBox").append("<button id='closeFeedback' onclick='closeFeedback()' name='"+langObj.closeButton+"' tool-tipX='"+langObj.closeButton+"' aria-label='"+langObj.closeButton+"' tabindex='0'/>");
	$("#feedbackBox").append("<div class='focusTrap' aria-hidden='true' tabindex='0'></div>");
	$( ".focusTrap").keyup(function(e){
		if (e.key == "Tab") {
			e.preventDefault();
			setFocus($("#closeFeedback"));
		}
	});
	$("#closeFeedback").keyup(function(e){
		if (e.key == "Escape" || e.key == "Esc") {
			closeFeedback(event.type);
		}
	});
	

	
	$("#feedbackBox").append("<h1 id='feedbackTitle'>"+stripHTML(title_str)+"</h1>");
	$("#feedbackBox").append("<div id='feedbackText'>"+feedback_str+"</div>");
	
	if(title_str == "" || title_str == " "){
		$("#feedbackTitle").attr("aria-hidden","true");
	}
	
	$("#feedbackBox").append("<div id='feedbackHandle'></div>");
	
	$("#qIcon-border").attr("tabindex", "-1");
	$("#fullscreen").attr("tabindex", "-1");
	$("#resetButton").attr("tabindex", "-1");
	$("#submitButton").attr("tabindex", "-1");
	$(".keyboardButton").attr("tabindex", "-1");
	$("#timer").attr("tabindex", "-1");
	$(".drag").attr("tabindex", "-1");
	$(".target").attr("tabindex", "-1");
	$(".target").removeAttr("tabindex");
	
	
	$("a").attr("tabindex", "-1");
	
	$("#content").attr("aria-hidden", "true");
	// setFocus($("#closeFeedback"));
	$("#closeFeedback").focus(); 		
	
	// Make the popup draggable.
	$("#feedbackBox").css("cursor", "pointer"); // For IE (IE does not support "grab" or "grabbing" cursors)
	$("#feedbackBox").css("cursor", "grab");
	$("#feedbackBox").draggable({
		start: function( event, ui ) {
			$(this).css("transform", "none");
			$(this).removeClass("popupTransition");
			$(this).css("cursor", "grabbing");
		},
		stop: function( event, ui ) {
			$(this).css("transform", "scale(1)");
			$(this).css("cursor", "grab");
			$(this).addClass("popupTransition");
		},
		handle: "#feedbackHandle"
	});
	
}

function closeFeedback(){
	$("#fade").removeClass("fadeAnimation");
	$("#feedbackBox").removeClass("popupAnimation");
	setTimeout(function(){
		$("#fade").remove();
		$("#feedbackBox").remove();
	},250);
	$("#qIcon-border").attr("tabindex", "0");
	$("#fullscreen").attr("tabindex", "0");
	$("#resetButton").attr("tabindex", "0");
	$("#submitButton").attr("tabindex", "0");
	$(".keyboardButton").attr("tabindex", "0");
	
	if(!$("#timer").hasClass("timerDisabled")){
		$("#timer").removeAttr("tabindex");
	}
	
	$(".drag").attr("tabindex", "0");
	$(".targetGray").attr("tabindex", "0");
	$(".finished").attr("tabindex", "-1");
	$(".dropped").attr("tabindex", "-1");
	$("#content").removeAttr("aria-hidden");
	$("a").removeAttr("tabindex");
	
	if(focusButton){
		setFocus($(focusButton));
		focusButton = "";	
	}
		
}

function setFocus(item){
	// console.log(item);
	if(use508){
		$(item).focus();
	}
}

var slideInToastInterval;
var slideOutToastInterval;
var deleteToastInterval;
function createToast(result){
	clearTimeout(deleteToastInterval);
	clearTimeout(slideInToastInterval);
	clearTimeout(slideOutToastInterval);
	
	$(".toast").remove();
	$("#main").append("<div class='toast toast-initial "+result+"-toast'><div class='toast-iconArea'/><div class='toast-icon'/><div id='closeToast' onclick=closeToast()/>"+langObj[result+"Feedback"]+"</div>");
	slideInToastInterval = setTimeout(function(){ 
		$(".toast").removeClass("toast-initial");
	}, 50);
	deleteToastInterval = setTimeout(function(){ 
		closeToast();
	}, 4000);
	
	setTimeout(function(){
		$("#hiddenFeedback").empty().append($(".toast").text());
		setTimeout(function(){
			$("#hiddenFeedback").empty();
		}, 500);
	},500);
}

function closeToast(){
	clearTimeout(deleteToastInterval);
	$(".toast").removeAttr("role");
	$(".toast").addClass("toast-initial");
	slideOutToastInterval = setTimeout(function(){ 
		$(".toast").remove();
	}, 500);
}

// Disable the drags
function disableDrags(){
	try{
		$(".drag").draggable( "disable" );
	}catch(e){
	}
	
	$(".drag").removeAttr("tabindex");
	// $(".drag").attr("tabindex","-1");
	$(".drag").removeAttr("role");
	$(".drag").css("cursor", "default");
	$(".drag").off("click");
	$(".drag").off("keyup");
	// $(".drag").attr("aria-disabled", "true");
	
}

function disableTargets(){
	$(".target").off("click");
	$(".tarret").off("keyup");
	// $(".target").css("cursor", "default");
	$(".target").removeAttr("role");
	$(".target").removeClass("targetGray");
	$("#targets").removeClass("targetsSelected");
	$(".focusTrap").remove();
}

function canGoFullScreen() {
	// === false to make sure fails safe if none of the properties exist
	return !(
		document.fullscreenEnabled === false ||
		document.webkitFullscreenEnabled === false ||
		document.mozFullScreenEnabled === false ||
		document.msFullscreenEnabled === false
	);
}

//FULLSCREEN API TOGGLE
function toggleFullScreen(){
	if($("#fullscreen").hasClass("expand")){
		openFullscreen();
	}else{
		closeFullscreen();
	}
	// $("#fullscreen").blur();	
}



var elem = document.documentElement;
function openFullscreen() {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) { /* Firefox */
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE/Edge */
		elem.msRequestFullscreen();
	}
}

function closeFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}
}


// adjust the size/position of elements when the window resizes.
$(window).resize(function() {
	resizeContent();
});

function resizeContent(){
	$("#dragOptions").remove();
	$("#dragOptionsFade").remove();
	$("#mobileDragsBackground").remove();
	$("#drags").show();
	$("#drags").removeAttr("style");
	$("#targets").removeAttr("style");
	
	if($(".drag_background").length > 0){
		$(".dragLI").addClass("dragImage");
	}
	var mainHeight = $("#main").outerHeight();
	var topHeight = $("#header").outerHeight();
	var bottomHeight = $("#footer").outerHeight();
	
	
	if($("#main").width()<=600){
		
		$("#targets").insertBefore("#drags");
		$(".dragLI").removeClass("dragImage");
		
		// Show the "Drag Options" button and resize targets to fill the available space.
		if(this.pageStyle == "style2"){
			$("#drags").hide();
			$("#dragOptions").remove();
			
			$("#targets").height(mainHeight - topHeight - bottomHeight - 70);
			$("<button id='dragOptions' onclick='showDragOptions()'><div id='dragOptionsText'>"+langObj.dragOptionsButton+"</div></button>").insertBefore("#targets");
			$("#dragOptions").append("<div id='dragOptionsIcon'></div>")
			// $("#drags").prepend("");
			$("#drags").prepend("<div id='mobileDragsBackground'><div class='dragOptionsTitle'>"+langObj.dragOptions+"</div><div id='dragOptionsClose' onclick='hideDragOptions()'/></div>");
			setTimeout(function(){
				$("#dragOptions").addClass("dragOptionsFinished");
				// $("#dragOptionsText").addClass("dragOptionsTextFinished");
			}, 750);
			
		}
	}else{
		// $("#targets").height(mainHeight - topHeight - bottomHeight);
		$("#targets").insertAfter("#drags");
	}
	if($("#main").width()>=1000){
		$("#fullscreen").removeClass("expand");
		$("#fullscreen").addClass("compress");
	}else{
		$("#fullscreen").removeClass("compress");
		$("#fullscreen").addClass("expand");
	}
	$("#rotate").remove();
	//
	// PHONE: Force Portrait Orientation
	if($(window).height()<430 ){
		if($(window).width()> $(window).height()){
			$("body").append("<div id='rotate'><div id='rotate_content'><div id='rotate_container'><div id='rotate_tablet' class='tablet_rotate'/></div>"+langObj.phoneLandscapeIntructions+"</div></div>");
			setTimeout(function(){
			   $("#rotate_tablet").removeClass("tablet_rotate");
			}, 500);
		}
	}
	// Message for small screens
	$("#smallScreenMessage").remove();
	if($(window).width() < 320 ){
		$("body").append("<div id='smallScreenMessage'><div>"+langObj.smallScreenMessage+"</div></div>");		
	}
	
	// Add a scrollbar to text if required (RIA 4).
	if($("#text_div").height() > ($("#main").height()-140)){
		$("#text_div").addClass("scrollText");
	}else{
		$("#text_div").removeClass("scrollText");
	}
	
	// RIA 4
	$("#main").removeClass("ria4");
	if($(window).width()>= 1025){
		$("#main").addClass("ria4");
	}
	
	alignDrags();
}

function alignDrags(){
	if($("#dragList").height() > $("#interactiveContent").height()){
		$("#dragList").addClass("scrollDrags");
	}else{
		$("#dragList").removeClass("scrollDrags");
	}
}


function showDragOptions(){
	$("#main").append("<div id='dragOptionsFade'></div>");
	$("#dragOptionsFade").hide();
	$("#dragOptionsFade").fadeIn();
	$("#fade").insertBefore($("#drags"));
	$("#drags").show();
	$("#drags").css("top", "150%");
	$( "#drags" ).animate({
		top: "50%",
	}, 500, "easeOutQuart", function() {
		// Animation complete.
	});
	// resizeDrags();
}

function hideDragOptions(){
	$("#dragOptionsFade").fadeOut(400, function(){
		$(this).remove();
	});
	$( "#drags" ).animate({
		top: "150%"
	  }, 500, "easeInQuart", function() {
		// Animation complete.
		$("#drags").hide();
		$("#drags").css("top", "50%");
	  });
}

function stripHTML(str){
	var tag_array = ["<p>", "</p>", "<b>", "</b>", "<u>", "</u>", "<i>", "</i>, <br>"];
	for(x=0; x<tag_array.length; x++){
		str = str.split(tag_array[x]).join("");
	}
	return str;
}

