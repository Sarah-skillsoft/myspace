
// Get the page id based on location.
var page_id = window.location.href.split("/launch.html").join("").split("-").join("_").split("/output/").pop().split(":").join("_").split(".").join("_").split("/").join("_").split("___").join("_").split("__").join("_");



// Old enableNext() function
function enableNext() {
	// console.log("enableNext()");
	var postObj = {
        id: "enableNextButton"
    }
    parent.postMessage(postObj, "*");
	// sessionStorage[page_id] = true;
};

// Old disableNext() function
function disableNext() {
	// console.log("disableNext()");
	var postObj = {
		id: "disableNextButton"
	}
	parent.postMessage(postObj, "*");
};




// Disable the RIA Next button if required.
if(this.forceContentVisitation == "true"){
	// Check to see if this page has already been completed.
	if (!sessionStorage[page_id]) {
			// disableNext();
	}else{
		// console.log("HTML page previously completed.");
	}
	disableNext();
}

// Function to request CCA_Audio_Navigation from the player
function getAudioNavStatus() {
	// console.log("REQ_CCA_AUDIONAV");
    var postObj = {
        type: "HTMLAUDIONAVIGATION",
		payload: {
			id: 'REQ_CCA_AUDIONAV'
		}
    };
    parent.postMessage(postObj, "*");
}

function getCompletion() {
	// console.log("REQ_HTML_COMPLETION");
    var postObj = {
        type: "HTMLAUDIONAVIGATION",
		payload: {
			id: 'REQ_HTML_COMPLETION'
		}
    };
    parent.postMessage(postObj, "*");
}

// Send HTML_TASK_DONE to the player
function markCompleted(){
	if(ccaHtmlCompletion != true){
		// console.log("HTML_TASK_DONE");
		var postObj = {
			type: "HTMLAUDIONAVIGATION",
			payload: {
				id: 'HTML_TASK_DONE'
			}
		};
		parent.postMessage(postObj, "*");
	}
	ccaHtmlCompletion = true;
}


var ccaAudioNavigation = false;
var ccaHtmlCompletion = false;
window.addEventListener('message', (event) => {
	try {
		const { type, payload } = event.data;
		// CCA_AUDIO_NAVIGATION
		if (type === 'HTMLAUDIONAVIGATION' && payload?.id === 'CCA_HTML_AUDIONAVIGATION') {
			ccaAudioNavigation = payload.value;
			// console.log("CCA_HTML_AUDIONAVIGATION: " + ccaAudioNavigation);
			// Mark page completed imediately if the ccaAudioNavigation == false and forceContentVisitation is not "true";
			if(ccaAudioNavigation == false && !this.forceContentVisitation){ // forceContentVisitation is either "true" or not defined at all.
				markCompleted();
			}
		}
		// CCA_HTML_COMPLETION
		if (type === 'HTMLAUDIONAVIGATION' && payload?.id === 'CCA_HTML_COMPLETION') {
			ccaHtmlCompletion = payload.value;
			// console.log("CCA_HTML_COMPLETION: " + ccaHtmlCompletion);
		}
	} catch (error) {
		console.error('Error processing message:', error);
	}
}, false);

// var ccaAudioNavigation = true;

getAudioNavStatus();
getCompletion();