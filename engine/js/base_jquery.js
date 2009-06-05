$(document).ready(function(){
	// init variables
	initx = false; //used for drawing squares
	mydrag = null; // contains the dragable element
	myresize = null; // contains the resizable element
	lastDraggable = null; // contains the last selected Draggable
	startdragx = 0; // initial positions of startdrag
	startdragy = 0;
	minWidthForLabel = 60; //pixel width necesarry to start showing label
	startdragObjects = {}; // initial positions of all select objects; used to add delta x,y values to during drag

	disableKeyListeners = false; //global variable which affects hot key listening
	shiftPressed = false; // if true, then shift key is being pressed down
	shiftAmount = 1; //1 or 10 pixels depending of shiftPressed
	ctrlPressed = false; // if true, then ctrl key is being pressed down
	cPressed = false; // if true, then c key is being pressed down

	offsetToWorkspaceX = $("#fWorkspace").offset().left;
	offsetToWorkspaceY = $("#fWorkspace").offset().top;

	// init functions
	setWorkspaceDimensions(); // set window dimensions the first time
	
	//set minmum and maximum widths of panelpages after they have been loaded
	fPanelPages.cssPanelWidthCon = parseInt($("#fPanelPages").css("width"));
	fPanelPages.cssPanelWidthExp = parseInt($("#fPanelPages").css("width")) + 80;
	
	jO.load('projects/project01.json','file'); //load JSON data + select workspace
	
	$("#fWorkspace").fShowMenu({ opacity:0.8,	query: "#fRightClickMenu"},function() {alert('tf');});

	// make document unselectable
	if (typeof(document.onselectstart) != "undefined") {
		document.onselectstart = fUnselectable.enable;
	} else {
		document.onmousedown = fUnselectable.enable;
		document.onmouseup = fUnselectable.disable;
	}

	//init listeners
	$(window).bind("resize",resized); // window resizing listener
	hotkeysEnable(); //enable hotkey listening
	$("#setwidth").bind("keyup",updateWidth);
	$("#setheight").bind("keyup",updateHeight);
	$("#xpos").bind("keyup",updateXpos);
	$("#ypos").bind("keyup",updateYpos);
	$(document).bind("mousemove",fGM.capture); //global mouse with page coordinates

	//first tool
	toolSelect();
	
	$("#fEditing").live("mouseover",function(){$(this).focus()}); //fix for enabling cursor to focus on fEditableText
	$(window).focus();
	
	//bind window focus event to resize
	$(window).bind("focus",setWorkspaceDimensions);
	
	//hovers for fS footer states controler
	$(".fSCheck,.fSTitle").hover(
      function () {
        $(this).parent().addClass('fSOver');
      }, 
      function () {
        $(this).parent().removeClass('fSOver');
      }
    );
	
	//hovers for instances
	$("#fFInstItems a").live("mouseover",
      function () {
	  	$("#fFInstTitle").html("Select: " + $(this).attr("title"));
      });
	$("#fFInstItems a").live("mouseout",
      function () {
	  	$("#fFInstTitle").html("All Instances:");
      });
	  
	 //focus window on click
	 $("#container").bind("click",fFocusWindow);
	 $("#fWorkspace").bind("click",fBlurInput);
	 
	 //select workspace
	 fSel.selectObject("fWorkspace");
});




// -------- General Resizing Functions -----
function setWorkspaceDimensions() {
	// get window height
	windowheight = $(window).height();
	windowwidth = $(window).width();

	// adjust for toolbars
	windowheight = windowheight - 79;
	windowwidth = windowwidth - 182;

	document.getElementById("fWorkspace").style.height = windowheight;
	document.getElementById("fWorkspace").style.width = windowwidth;
	document.getElementById("toolbox").style.height = windowheight + 3;
	document.getElementById("rightpanel").style.height = windowheight;
	
	$(".fPanelItemsList").css("height",$("#fPanelPages").height() - 48);
}

function fFocusWindow() {
	$(window).focus();
	
}

function fBlurInput(){
	$("#xpos").blur();
}



// -------- HotKey Functions -----

function hotkeysEnable() {
	$.hotkeys.add('Down', keyShiftDownS);
	$.hotkeys.add('Up', keyShiftUpS);
	$.hotkeys.add('Left', keyShiftLeftS);
	$.hotkeys.add('Right', keyShiftRightS);
	$.hotkeys.add('Shift+Down', keyShiftDownS);
	$.hotkeys.add('Shift+Up', keyShiftUpS);
	$.hotkeys.add('Shift+Left', keyShiftLeftS);
	$.hotkeys.add('Shift+Right', keyShiftRightS);
	$.hotkeys.add('Ctrl+C', keyCtrlC);
	$.hotkeys.add('Ctrl+V', keyCtrlV);
	$(document).bind("keydown",keypressed); // detect which keys are pressed for tools, and delete and such
	$(document).bind("keyup",keyreleased); // detect if some keys are let go (ex. shift)
}

function hotkeysDisable() {
	$.hotkeys.remove('Down', keyShiftDownS);
	$.hotkeys.remove('Up', keyShiftUpS);
	$.hotkeys.remove('Left', keyShiftLeftS);
	$.hotkeys.remove('Right', keyShiftRightS);
	$.hotkeys.remove('Shift+Down', keyShiftDownS);
	$.hotkeys.remove('Shift+Up', keyShiftUpS);
	$.hotkeys.remove('Shift+Left', keyShiftLeftS);
	$.hotkeys.remove('Shift+Right', keyShiftRightS);
	$.hotkeys.remove('Ctrl+C', keyCtrlC);
	$.hotkeys.remove('Ctrl+V', keyCtrlV);
	$(document).unbind("keydown",keypressed);
	$(document).unbind("keyup",keyreleased);
}

function keyreleased(event) {
	//whichkey is set to the keycode number
	if (event.keyCode != 0) { whichkey = event.keyCode;}
	if (event.which != 0) { whichkey = event.which;}
	
	//shift released
	if (whichkey == "16") {
		shiftPressed = false;
		shiftAmount = 1;
		fDebugJson.triggerPressedRecently = true;
	}
	//ctrl released
	if (whichkey == "17") {
		ctrlPressed = false; 
	}
	
	//z released
	if (whichkey == "90") { fStateManager.hideManager(); }
	
	//x released
	if (whichkey == "88") { fIdeaManager.hideManager(); }
	
	//f released
	if (whichkey == "70") { fFormManager.hideManager(); fFormManager.opened = false;}
	
	// c key
	//if (whichkey == "67") { cPressed = false; if(fCBManager.mouseover == false) {fCBManager.hideManager();} }
	if (whichkey == "67") { fCBManager.hideManager(); }
}

function keypressed(event) {
	//whichkey is set to the keycode number
	if (event.keyCode != 0) { whichkey = event.keyCode;}
	if (event.which != 0) { whichkey = event.which;}
	
	//alert(whichkey);
	// 46 is the delete key
	if (whichkey == "46") {
		if (fSel.sI.length > 0) {
			for (var i = 0; i < fSel.sI.length; i++) {
				//remove from "contains" of parent instance in jData
				parentInsName = $("#" + fSel.sI[i]).parent().attr("id");
				if (parentInsName == "fWorkspace") {
					delete jO.jData.pages[fPanelPages.selectedPageId].contains[jO.tr(fSel.sI[i])];
				}
				else if (parentInsName.match("ins")) {
					parentObjName = jO.jData.instances[parentInsName].of;
					//remove contains in parent and object
					delete jO.jData.instances[parentInsName].states[fSession[parentInsName].state].contains[jO.tr(fSel.sI[i])];
					delete jO.jData.objects[parentObjName].states[fSession[parentInsName].state].contains[jO.tr(fSel.sI[i])];
				}

				if (fSel.sI[i].match("ins")) {
					//remove instance
					delete jO.jData.instances[fSel.sI[i]];
					
					//todo clear actual objects in jO if (last instance cleared)
				}
				else if (fSel.sI[i].match("t")) {
					//remove real text element
					delete jO.jData.elements[jO.tr(fSel.sI[i])];
				}
				
				//remove DOM objects from the workspace
				if(fSel.sI[i] != "fWorkspace") {
					$("#" + fSel.sI[i]).remove();
				}
				
			}
			//empty the whole array
			fSel.sI.splice(0);
			fSel.selectObject($("#fWorkspace"));
		}
		
		fWorkspace.redraw({type: 'page'}); 
	}

	// ctrl key
	if (whichkey == "17") {
		ctrlPressed = true; // sets as true or false. used to restrict keypresses to single keys (ex. "T" for text tool, and not "ctrl t")	
	}
	
	// shiftkey
	//shift released
	if (whichkey == "16") {
		shiftAmount = 10;
	}
	shiftPressed = event.shiftKey; // sets as true or false. used by fDebugJson and multiple object selection
	
	
	//toolbars (only run if shift / ctrl are NOT pressed)
	if ((whichkey == "83") && (shiftPressed == false) && (ctrlPressed == false)) { toolSelect(); }
	if ((whichkey == "79") && (shiftPressed == false) && (ctrlPressed == false)) { toolObject(); }
	if ((whichkey == "84") && (shiftPressed == false) && (ctrlPressed == false)) { toolText(); }
	//if ((whichkey == "70") && (shiftPressed == false) && (ctrlPressed == false)) { toolForm(); }

	
	//run code to open fDebugJson on press of shift
	if (event.shiftKey) {
		fDebugJson.trigger();
	}
	// and close it when an ESC is pressed
	if (whichkey == "27") { fDebugJson.hideManager(); }
	
	// z key
	if (whichkey == "90") { fStateManager.displayManager(); }
	
	// f key
	if ((whichkey == "70") && ($("#fFormManager").css("display") == "none")) { fFormManager.displayManager(); }
	
	// x key
	if (whichkey == "88") { fIdeaManager.displayManager(); }
	
	// c key
	if (whichkey == "67") { cPressed = true; fCBManager.displayManager(); }
	
	// 1 key
	if (whichkey == "49") { setPriority(1); }
	
	// 2 key
	if (whichkey == "50") { setPriority(2); }
	
	// 3 key
	if (whichkey == "51") { setPriority(3); }
	
	// 4 key
	if (whichkey == "52") { setPriority(4); }
	
	// 5 key
	if (whichkey == "53") { setPriority(5); }
	
	
	//handle autotext if lastText is defined 
	if(fSel.lastText != null) {
		//if exists on page and does not have any text
		if (($("#" + fSel.lastText).length > 0) && (!$("#" + fSel.lastText).hasClass("fTextHasTxt"))) { //test if exists on workspace
		
			//if is a proper key. keypressed is not: shift,ctrl,esc,alt,tab,pgup,pgdn,home,end,insr,delete,fkeys
			var allowEdit = true;
			shiftPressed = false; //unlock shift just in case (buggy when starting to auto edit while holding SHIFT)
			var forbiddenKeys = new Array(16,17,27,18,9,33,34,35,36,45,46,112,113,114,115,116,117,118,119,120,121,122,123);
			for (i=0; i < forbiddenKeys.length; i++) {
				if (forbiddenKeys[i] == whichkey) { allowEdit = false;}
			}

			if(allowEdit) {
				//make editable
				$("#" + fSel.lastText).fEditableText();
				
				//select
				fSel.selectObject(fSel.lastText);
			}
		}
	}
}



function setPriority(what){
	if (fSel.nInst != "") {
		//remove all classes
		$("#" + fSel.nInst).removeClass("p1 p2 p3 p4 p5");
		
		//add
		$("#" + fSel.nInst).addClass("p" + what);
	}
}



function keyShiftDownS(event) {
	// move selected object 1 pixels down
	if ((fSel.sI.length > 0) && (fSel.sI[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sI.length; i++) {
			newxpos = parseInt($("#" + fSel.sI[i]).css("top"));
			newxpos = newxpos + shiftAmount;
			$("#" + fSel.sI[i]).css({top: newxpos});
			
			if (fSel.sI[i].match("ins")) {
				//force inheritance
				if(fSession[jO.tr(fSel.sI[i])].editAs == 0) {	jO.update(jO.tr(fSel.sI[i]), {type: "instance",iPos: 1});	}
				else if(fSession[jO.tr(fSel.sI[i])].editAs == 1) { jO.update(jO.tr(fSel.sI[i]), {type: "instance",iPos: 0}); }
				//update
				jO.update(fSel.sI[i], {y: newxpos});
			}
			else if (fSel.sI[i].match("t|f")) {
				jO.updateElements(jO.tr(fSel.sI[i]), {y: newxpos});
			}
		}
		fWorkspace.redraw({type: 'page'}); 
		fFooter.redrawFooter();
	}
}

function keyShiftUpS(event) {
	// move selected object 1 pixels up
	if ((fSel.sI.length > 0) && (fSel.sI[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sI.length; i++) {
			newxpos = parseInt($("#" + fSel.sI[i]).css("top"));
			newxpos = newxpos - shiftAmount;
			$("#" + fSel.sI[i]).css({top: newxpos});
			
			if (fSel.sI[i].match("ins")) {
				//force inheritance
				if(fSession[jO.tr(fSel.sI[i])].editAs == 0) {	jO.update(jO.tr(fSel.sI[i]), {type: "instance",iPos: 1});	}
				else if(fSession[jO.tr(fSel.sI[i])].editAs == 1) { jO.update(jO.tr(fSel.sI[i]), {type: "instance",iPos: 0}); }
				//update
				jO.update(fSel.sI[i], {y: newxpos});
			}
			else if (fSel.sI[i].match("t|f")) {
				jO.updateElements(jO.tr(fSel.sI[i]), {y: newxpos});
			}
		}
		fWorkspace.redraw({type: 'page'}); 
		fFooter.redrawFooter();
	}
}

function keyShiftRightS(event) {
	// move selected object 1 pixels right
	if ((fSel.sI.length > 0) && (fSel.sI[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sI.length; i++) {
			newxpos = parseInt($("#" + fSel.sI[i]).css("left"));
			newxpos = newxpos + shiftAmount;
			$("#" + fSel.sI[i]).css({left: newxpos});

			if (fSel.sI[i].match("ins")) {
				//force inheritance
				if(fSession[jO.tr(fSel.sI[i])].editAs == 0) {	jO.update(jO.tr(fSel.sI[i]), {type: "instance",iPos: 1});	}
				else if(fSession[jO.tr(fSel.sI[i])].editAs == 1) { jO.update(jO.tr(fSel.sI[i]), {type: "instance",iPos: 0}); }
				//update
				jO.update(fSel.sI[i], {x: newxpos});
			}
			else if (fSel.sI[i].match("t|f")) {
				jO.updateElements(jO.tr(fSel.sI[i]), {x: newxpos});
			}
		}
		fWorkspace.redraw({type: 'page'}); 
		fFooter.redrawFooter();
	}
}

function keyShiftLeftS(event) {
	// move selected object 1 pixels left
	if ((fSel.sI.length > 0) && (fSel.sI[0] != "fWorkspace")) {
		for (var i = 0; i < fSel.sI.length; i++) {
			newxpos = parseInt($("#" + fSel.sI[i]).css("left"));
			newxpos = newxpos - shiftAmount;
			$("#" + fSel.sI[i]).css({left: newxpos});
			
			if (fSel.sI[i].match("ins")) {
				//force inheritance
				if(fSession[jO.tr(fSel.sI[i])].editAs == 0) {	jO.update(jO.tr(fSel.sI[i]), {type: "instance",iPos: 1});	}
				else if(fSession[jO.tr(fSel.sI[i])].editAs == 1) { jO.update(jO.tr(fSel.sI[i]), {type: "instance",iPos: 0}); }
				//update
				jO.update(fSel.sI[i], {x: newxpos});
			}
			else if (fSel.sI[i].match("t|f")) {
				jO.updateElements(jO.tr(fSel.sI[i]), {x: newxpos});
			}
		}
		fWorkspace.redraw({type: 'page'}); 
		fFooter.redrawFooter();
	}
}
function keyCtrlC(event) {
	fCBManager.copy();
}
function keyCtrlV(event) {
	//launch paste box if not opened
	if(fCBManager.openedPaste == false) {
		fCBManager.displayPasteManager();	
	}
	//paste if ctrlV pressed a second time
	else {
		fCBManager.paste();	
	}
}



function updateWidth(event) {
	if(fSel.sI[0] != "fWorkspace") {
		//make sure it's an integer
		var val = parseInt($("#setwidth").val());
		$("#setwidth").val(val);
		$("#" + fSel.sI[0]).width($("#setwidth").val());
		jO.update(fSel.sI[0],{w : parseInt($("#setwidth").val())});
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
	}
}

function updateHeight(event) {
	if(fSel.sI[0] != "fWorkspace") {
		//make sure it's an integer
		var val = parseInt($("#setheight").val());
		$("#setheight").val(val);
		$("#" + fSel.sI[0]).height($("#setheight").val());
		jO.update(fSel.sI[0],{h : parseInt($("#setheight").val())});
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
	}
}

function updateXpos(event) {
	if(fSel.sI[0] != "fWorkspace") {
		//make sure it's an integer
		var val = parseInt($("#xpos").val());
		$("#xpos").val(val);
		$("#" + fSel.sI[0]).css("left", $("#xpos").val() + "px");
		jO.update(fSel.sI[0],{x : parseInt($("#xpos").val())});
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
	}
}

function updateYpos(event) {
	if(fSel.sI[0] != "fWorkspace") {
		//make sure it's an integer
		var val = parseInt($("#ypos").val());
		$("#ypos").val(val);
		$("#" + fSel.sI[0]).css("top", $("#ypos").val() + "px");
		jO.update(fSel.sI[0],{y : parseInt($("#ypos").val())});
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
	}
}




function updateInfoXYPos() {
	$("#xpos").val(parseInt($("#" + fSel.sI[0]).css("left")));
	$("#ypos").val(parseInt($("#" + fSel.sI[0]).css("top")));

	if(fSel.sI[0] == "fWorkspace") {
		$("#xpos").val(0);
		$("#ypos").val(0);
	}
}

function updateInfoWH() {
	$("#setwidth").val($("#" + fSel.sI[0]).width());
	$("#setheight").val($("#" + fSel.sI[0]).height());

	if(fSel.sI[0] == "fWorkspace") {
		$("#setwidth").val(0);
		$("#setheight").val(0);
	}
}



function Draw(event){
	//Draw function is rerun continously onmousemove when a text or object tool is selected
	var element=$(event.target);
	posx = event.pageX;
	posy = event.pageY;
	
	//This is ran once after a mousepress
	this.onmousedown=function(){
		// set drawWhere
		if (fSel.sI[0] != null) {
			drawWhere = $("#" + fSel.sI[0]);
		}
		
		//check if the selected item is on the selected page
		if(!$("#" + fSel.sI[0]).length > 0) {
			//if not, then select the workspace :)
			fSel.selectObject($("#fWorkspace"));
			drawWhere = $("#fWorkspace");
		}
		
		// do not allow to draw by default
		fWorkspace.allowDraw = false;
		
		// only draw if the clicked div is the workspace div
		if (element.attr("id") == "fWorkspace") {
			fWorkspace.allowDraw = true;
		}

		// or if the ancestors contain the workspace div, however check only if the allowDraw has not been enabled already, to conserve cpu
		if (fWorkspace.allowDraw == false) {
			ancestorarray = element.parents();
			for ( var i=0, len=ancestorarray.length; i<len; ++i ){
				if ($(ancestorarray[i]).attr("id") == "fWorkspace") {
					fWorkspace.allowDraw = true;
					break;
				}
			}
		}
		
		//do not allow to draw if drawing tools are not chosen
		if ((fTools.selected != "toolObject") && (fTools.selected != "toolText")) {
			fWorkspace.allowDraw = false;
		}

		// draw rectangle
		if (fWorkspace.allowDraw == true) {
			//select the parent if workspace or instance is not selected
			if (!(fSel.sI[0].match("fWorkspace")||fSel.sI[0].match("ins"))) {
				fSel.selectObject($("#" + fSel.sI[0]).parent());
				drawWhere = $("#" + fSel.sI[0]);
			}
				
			
			//disable select
			fUnselectable.enable;
			
			// not on the clicked element, but on the selected
			offsetx = drawWhere.offset().left;
			offsety = drawWhere.offset().top;
			
			// - parent's position?
			initx=posx - offsetx;
			inity=posy - offsety;

			if (fTools.selected == "toolText") {
				whatelement = "div";
				whatclass = "fText";
				whatid = jO.getAvailableId('txt');
			}
			if (fTools.selected == "toolObject") {
				whatelement = "div";
				whatclass = "fObject";
				whatid = jO.getAvailableId('inst');
			}

			d = document.createElement(whatelement);
			d.className=whatclass;
			d.style.left=initx+'px';
			d.style.top=inity+'px';
			d.id=whatid;
			drawWhere.append(d);
		}
	}
	
	//This is ran once after a mouseup
	this.onmouseup=function(){
		initx=false;
		inity=false;
		if (fWorkspace.allowDraw == true) {
			//disable the other defined mousedown function
			this.onmousedown = null;
			this.onmouseup = null;
			
			position = $(d).position();
			width = $(d).width();
			height = $(d).height();
			
			//correct width and height for click erros
			if (width < 10) { width = 20};
			if (height < 10) { height = 20};
			
			//create the object in JSON
			//INSTANCE
			if (fTools.selected == "toolObject") {
				name = "New Object";
				ID = jO.createObj(name, position.left, position.top, width, height);
			}
			//TXT
			if (fTools.selected == "toolText") {
				txt = "";
				ID = jO.createTxt(txt, position.left, position.top, width, height);
			}

			//instatiate it
			if (fSel.sI[0] != "fWorkspace") {
				newInstanceName = jO.instantiate(ID, fSel.sI[0], fSession[fSel.nInst].state);
				
				//force inheritance
				//if 0 editing as Object
				if (fSel.editAs == 0) {jO.update(fSel.nInst, {type: "instance",iContents: 1});}
			}
			else {
				newInstanceName = jO.instantiate(ID, fSel.sI[0]);
			}
		
			//update footer
			fFooter.redrawFooter();
			
			//update Workspace
			//INSTANCE
			if (fTools.selected == "toolObject") {
				if (fSel.sI[0] != "fWorkspace") {
				//redraw parent
				//fWorkspace.redraw({type: 'object',item: fSel.jInst.of});
				}
				else {
					//redraw itself (to have a label)
					//fWorkspace.redraw({type: 'instance',item: $(d).attr("id")});
				}
				fWorkspace.redraw({type: 'page'});
			}
			//TXT
			if (fTools.selected == "toolText") {
				//refresh page for all TXT items
				fWorkspace.redraw({type: 'page'});
				fSel.lastText = newInstanceName;
			}
			
			
			//INSTANCE Label make editable
			if ((fTools.selected == "toolObject") && (width > minWidthForLabel)) {
				$(d).fEditableLabel();
			}
			
			
			//enable cursor select tool
			toolSelect();
			
			//enable select
			fUnselectable.disable;
			
			// do not allow to draw - finished drawing
			fWorkspace.allowDraw = false;
		}
	}

	//This is ran continously after a mousepress and before a mouseup - it redraws the object
	if(initx){
		if (fWorkspace.allowDraw == true) {
			var setwidth = Math.abs(posx - initx - offsetx);
			var setheight = Math.abs(posy - inity - offsety);
			
			d.style.width = setwidth + 'px';
			d.style.height = setheight + 'px';
			d.style.left = posx - initx - offsetx < 0 ? posx - offsetx + 'px' : initx + 'px';
			d.style.top = posy - inity - offsety < 0 ? posy - offsety + 'px' : inity + 'px';
			
			//update setwidth & setheight boxes
			document.getElementById("setwidth").value = setwidth;
			document.getElementById("setheight").value = setheight;
		}
	}
}


function dragRegister() {
	startdragx = parseInt($("#"+mydrag).css("left"));
	startdragy = parseInt($("#"+mydrag).css("top"));
	for (var i = 0; i < fSel.sI.length; i++) {
		startdragObjects[fSel.sI[i]] = {};
		startdragObjects[fSel.sI[i]].x = parseInt($("#" + fSel.sI[i]).css("left"));
		startdragObjects[fSel.sI[i]].y = parseInt($("#" + fSel.sI[i]).css("top"));
	}
}


function dragItems() {
	//drag all remaining items which are also selected
	// calculate how much movement there is during the drag
	movex = parseInt($("#"+mydrag).css("left")) - startdragx;
	movey = parseInt($("#"+mydrag).css("top")) - startdragy;

	// loop through all remaining selected items except fWorkspace and
	for (var i = 0; i < fSel.sI.length; i++) {
		//update position on workspace
		$("#" + fSel.sI[i]).css("left", startdragObjects[fSel.sI[i]].x + movex + "px");
		$("#" + fSel.sI[i]).css("top", startdragObjects[fSel.sI[i]].y + movey + "px");
	}
	//update footer
	updateInfoXYPos();
}


function dragStop() {
	//update the workspace one more time in case there is pixel lag during drag
	dragItems();
	movex = parseInt($("#"+mydrag).css("left")) - startdragx;
	movey = parseInt($("#"+mydrag).css("top")) - startdragy;
	
	//update JSON position of items
	for (var i = 0; i < fSel.sI.length; i++) {
		var itemRef = "";
		// OBJECTS / INSTANCES
		if (fSel.sI[i].match("ins") != null) {
			if (fSel.editAs == 0) { //if 0 editing as Object
				//update JSON + Force inheritance of iPos = 1
				jO.update(fSel.sI[i], {
					type: "object",
					x: $("#" + fSel.sI[i]).position().left,
					y: $("#" + fSel.sI[i]).position().top,
				});
				
				jO.update(fSel.sI[i], {
					type: "instance",
					iPos: 1
				});
			}
			else { //else editing as Instance
				//update JSON + Force inheritance of iPos = 0
				jO.update(fSel.sI[i], {
					type: "instance",
					x: $("#" + fSel.sI[i]).position().left,
					y: $("#" + fSel.sI[i]).position().top,
					iPos: 0
				});
			}
			
			//update Workspace
			if(fSel.editAs ==0)  {
				//update all instances with which use this object, by passing object name (extracted from instance/of)
				fWorkspace.redraw({type: 'object',item : fSel.jInst.of}); 
			}
		}
		// Text
		if ((fSel.sI[i].match("t") != null) || (fSel.sI[i].match("f") != null)) {
			jO.updateElements(jO.tr(fSel.sI[i]), {
				x: $("#" + fSel.sI[i]).position().left,
				y: $("#" + fSel.sI[i]).position().top,
			});
			
			fWorkspace.redraw({type: 'page'}); 
		}

		fFooter.redrawFooter();
				
		
	}
}

function resizeStop() {
	updateInfoWH();
	
	//update JSON position of items
	
	for (var i = 0; i < fSel.sI.length; i++) {
		var itemRef = "";
		
		
		// OBJECTS / INSTANCES
		if (fSel.sI[i].match("ins") != null) {
			//calculate necessary relative position change
			//if editing as object master
			
			//if (fSession[fSel.nInst].editAs == 0) {
			//	initx = fSel.jObj.states[fSession[fSel.nInst].state].x;
			//	inity = fSel.jObj.states[fSession[fSel.nInst].state].y;
			//}
			//else instance
			//else {
				//if not inheriting from object
				if (fSel.jInst.states[fSession[fSel.nInst].state].iPos == 0) {
					initx = fSel.jInst.states[fSession[fSel.nInst].state].x;
					inity = fSel.jInst.states[fSession[fSel.nInst].state].y;
				}
				//if inheriting from object
				else {
					initx = fSel.jObj.states[fSession[fSel.nInst].state].x;
					inity = fSel.jObj.states[fSession[fSel.nInst].state].y;
				}
			//}
			//calculate difference in positional change
			changeX = $("#" + fSel.sI[i]).position().left - initx;
			changeY = $("#" + fSel.sI[i]).position().top - inity;
			
			//if 0 editing as Object
			if (fSel.editAs == 0) {
				itemRef = fSel.jObj;
				
				//update all instances' position if they are inheriting size to compensate for top, left position changes during resize	
				var Instances = jO.getInstancesOfObj(fSel.jInst.of, {
					type: "workspace"
				});
				for (var j = 0; Instances.length > j; j++) {
					instRef = jO.jData.instances[Instances[j]];
					
					//if they inherit size but not position
					if ((instRef.states[fSession[fSel.nInst].state].iSize == 1) && (instRef.states[fSession[fSel.nInst].state].iPos == 0) && (Instances[j] != fSel.sI[i])) {
						//alert(Instances[j] + ":"+ fSel.sI[i]);
						//update the instance's position relatively + force inheritance of size
						jO.update(Instances[j], {
							type: "instance",
							xs: changeX,
							ys: changeY,
							w: $("#" + fSel.sI[i]).width(),
							h: $("#" + fSel.sI[i]).height()
						});
					}
				}
				
				//also update the object of course
				//alert(changeX + ":" + changeY)
				jO.update(fSel.nInst, {
					type: "object",
					xs: changeX,
					ys: changeY,
					w: $("#" + fSel.sI[i]).width(),
					h: $("#" + fSel.sI[i]).height(),
				});
				
				//force inheritance
				jO.update(fSel.nInst, {
					type: "instance",
					xs: changeX,
					ys: changeY,
					iSize: 1
				});
			}
			//else editing as Instance
			else {
				itemRef = fSel.jInst;
				//update the instance's position relatively + force inheritance of size
				jO.update(fSel.nInst, {
					type: "instance",
					xs: changeX,
					ys: changeY,
					w: $("#" + fSel.sI[i]).width(),
					h: $("#" + fSel.sI[i]).height(),
					iSize: 0
				});
			}
			
			//update footer (if not editing Text)
			if (fWorkspace.editingText == false) {
				fFooter.redrawFooter();
				
				//update Workspace
				if (fSel.editAs == 0) {
					//update all instances with which use this object, by passing object name (extracted from instance/of)
					fWorkspace.redraw({
						type: 'object',
						item: fSel.jInst.of
					});
				}
			}
			
		}	
		// TEXT
		if (fSel.sI[i].match("t") != null) {
			//calculate difference in positional change
			changeX = $("#" + fSel.sI[i]).position().left - jO.jData.elements[jO.tr(fSel.sI[i])].x;
			changeY = $("#" + fSel.sI[i]).position().top - jO.jData.elements[jO.tr(fSel.sI[i])].y;
			
			jO.updateElements(jO.tr(fSel.sI[i]), {
				xs: changeX,
				ys: changeY,
				w: $("#" + fSel.sI[i]).width(),
				h: $("#" + fSel.sI[i]).height(),
			});
			
			fWorkspace.redraw({type: 'page'});
		}
		
		
	}
}


function resized(event) {
	setWorkspaceDimensions(); // fix wrapper/workspace height
}


function killDrag(event) {
	if(mydrag) { $("#"+mydrag).draggable("destroy"); mydrag = null; }
}

function killResizable(event) {
	if(myresize) {
		$("#"+myresize).resizable("destroy"); myresize = null;
	}
}



// -------- Object Functions ----
function objectSortUp() {
	//increase zindex of first selected item // todo multiple item?
	alert($("#" + fSel.sI[0]).css("z-index"));
	$("#" + fSel.sI[0]).css("z-index",100);
}








// -------- fluidia Functions -----
$.fn.fEditable = function() {
	clickedElement = this;

	//overlay an input box on top of the double clicked div
	clickedElement.after('<input class="fEditable" id="fEditing" type="box" value="' + clickedElement.html() + '"></input>');

	//get the newly created element
	inputElement = this.next();

	//hide the clicked element
	clickedElement.hide();

	//focus the newly created editable input box
	inputElement.focus();
	hotkeysDisable(); //because people will be typing

	//attach on change
	inputElement.bind("change blur",closeEditing);
	$(window).bind("click",closeEditing);
}

function closeEditing(){ // if I have "blur change" together AIR crashes
	// update the DOM
	clickedElement.html(inputElement.attr("value"));
	//update jData
	jO.jData.pages[clickedElement.attr("id")].pageName = inputElement.attr("value");
	
	clickedElement.show();
	hotkeysEnable();
	inputElement.remove();
	
	$(window).unbind("click",closeEditing);
}

$.fn.fEditableLabel = function() {
	fWorkspace.allowSaveLabel = true; //a safety fix to stop from saveLavel running twice from multiple event triggers
	clickedElement = this;
	//sometimes an fLabel element is passed, and sometimes the fObject or instance element is passed
	//if it's an fLabel, go up two levels 
	if($(clickedElement).attr("id") == "") {
		clickedElement = $(clickedElement).parent().parent();
	}

	objref = jO.jData.objects[jO.jData.instances[$(clickedElement).attr("id")].of];
	clickedElement = $("#" + clickedElement.attr("id"));
	
	//save clickedElement for future reference
	fWorkspace.editingLabelInstance = clickedElement.attr("id");
	
	//overlay an input box on top of the double clicked div
	if ((objref.name == "") || (objref.name == "New Object")) {
		clickedElement.find(".fLabel").html('<span class="fLBracket">[</span> <input class="fEditable fEditableLabel" id="fEditing" type="box" value=""></input>  <span class="fLBracket">]</span>');
	}
	else {
		clickedElement.find(".fLabel").html('<span class="fLBracket">[</span> <input class="fEditable fEditableLabel" id="fEditing" type="box" value="' + objref.name + '"></input>  <span class="fLBracket">]</span>');
	}

	//focus the newly created editable input box
	clickedElement.find(".fEditableLabel").focus();
	hotkeysDisable(); //because people will be typing
	killDrag(); //because people might want to highlight text

	//attach on change
	clickedElement.find(".fEditableLabel").bind("change blur",fWorkspace.saveLabel);
	$("#container").bind("click",fWorkspace.saveLabel);
}


$.fn.fEditableText = function() {
	fWorkspace.editingText = true;
	clickedElement = this;

	txtref = jO.jData.elements[jO.tr($(clickedElement).attr("id"))];
	
	//objref = jO.jData.objects[jO.jData.instances[$(clickedElement).attr("id")].of];
	clickedElement = $("#" + clickedElement.attr("id"));
	
	//save clickedElement for future reference
	fWorkspace.editingTextInstance = clickedElement.attr("id");
	
	//overlay an input box on top of the double clicked div
	if ((txtref.txt == "") || (txtref.txt == "New Text")) {
		clickedElement.html('<textarea class="fEditableText" id="fEditing" name="a"></textarea>');
	}
	else {
		clickedElement.html('<textarea class="fEditableText" id="fEditing" name="a">' + txtref.txt + '</textarea>');
	}

	
	hotkeysDisable(); //because people will be typing
	killDrag(); //because people might want to highlight text

	//attach on change
	$("#container").bind("click",fWorkspace.saveText);
	
	//focus the newly created editable input box
	$("#fEditing").focus();
}



// -------- Tool Functions -----
// The left most tool functions
function toolObject() {
	//selectedTool
	fTools.selected = "toolObject";

	//clear all tools
	fTools.clearIcons(); // Visually
	fTools.clearEvents(); // Eventwise
	fTools.crosshairOn();
	killDrag(); // remove all dragging behaviours
	killResizable(); // remove all resizable

	document.getElementById("iconObject").src = "engine/images/button_object_on.gif";

	$("#fWorkspace").bind("mousemove",Draw);
	
	fSel.highlight();
}


function toolForm() {
	fTools.selected = "toolForm";

	//clear all tools
	fTools.clearIcons(); // Visually
	fTools.clearEvents(); // Eventwise
	fTools.crosshairOff();
	killDrag(); // remove all dragging behaviours
	killResizable(); // remove all resizable

	document.getElementById("iconForm").src = "engine/images/button_form_on.gif";

	fSel.highlight();
	
	$(window).unbind("mouseup",fFormManager.hideWrap);
	
	fFormManager.displayManager();
	
	$(window).bind("mouseup",fFormManager.hideWrap);
}


function toolText() {
	fTools.selected = "toolText";

	//clear all tools
	fTools.clearIcons(); // Visually
	fTools.clearEvents(); // Eventwise
	fTools.crosshairOn();
	killDrag(); // remove all dragging behaviours
	killResizable(); // remove all resizable

	document.getElementById("iconText").src = "engine/images/button_text_on.gif";

	$("#fWorkspace").bind("mousemove",Draw);
	
	fSel.highlight();
}


function toolSelect() {
	fTools.selected = "toolSelect";

	//clear all tools
	fTools.clearIcons(); // Visually
	fTools.clearEvents(); // Eventwise
	fTools.crosshairOff();

	document.getElementById("iconSelect").src = "engine/images/button_arrow_on.gif";

	$("#fWorkspace").bind("click",fSel.selectBinding);
	
	//enable last drag
	if (fSel.sI[0] != null) {
	//	fSel.selectObject(fSel.sI[0]);
	}
}



function rollOver(what) {
	currentstate = $(what).children().attr("src");
	newstate = currentstate.replace("_off","_over");
	$(what).children().attr("src",newstate);
}

function rollOut(what) {
	currentstate = $(what).children().attr("src");
	newstate = currentstate.replace("_over","_off");
	$(what).children().attr("src",newstate);
}



// ----- Modified jContextMenu for Right clicking ------
$.fn.fShowMenu = function(options) {
	var opts = $.extend({}, $.fn.fShowMenu.defaults, options);
	$(this).bind("contextmenu",function(e){
		//chech how many and which objects are underneath the click
		clickedX = e.pageX;
		clickedY = e.pageY;

		//create DIVS holders
		$("#container").append('<div id="fRightClickMenu"></div>');

		var countItems = 0;
		// foreach div.fObject compare clickedX to elementX + width (+do the same for Y)
		$("div.fObject").each(function() {

			whatelement = $(this);
			elementX = $(this).offset().left;
			elementY = $(this).offset().top;
			elementW = $(this).width();
			elementH = $(this).height();

			//see if the object was clicked on and attach object links
			if ((elementX < clickedX) && (clickedX < elementX + elementW) && (elementY < clickedY) && (clickedY < elementY + elementH)) {
				$("#fRightClickMenu").prepend('<div onclick="fSel.selectObject(' + $("div").index(this) + ')"><a href="#">Element Name</a></div>');
				$("#fRightClickMenu div:first-child a").html(whatelement.attr("id"));
				
				// attach parent,child,selected indicators if available
				if (whatelement.attr("id") == fSel.sI[0]) { $("#fRightClickMenu div:first-child").addClass("selected"); }
				if (whatelement.attr("id") == $("#" + fSel.sI[0]).parent().attr("id")) { $("#fRightClickMenu div:first-child").addClass("parent"); }
				// TODO children??
				// TODO reflect multiple selects?
				countItems++;
			}
		});
		//show menu only if countItems exist
		if (countItems > 0) {
			$(opts.query).show().css({
				top:e.pageY+"px",
				left:e.pageX+"px",
				position:"absolute",
				opacity: opts.opacity,
				zIndex: opts.zindex
			});
		}
		else {
			$(opts.query).remove();
		}
		return false;
	});
	$(document).bind("click",function(e){
		$(opts.query).remove();
	});
};

$.fn.fShowMenu.defaults = {
	zindex: 2000,
	query: document,
	opacity: 1.0
};



// Global Mouse, used to capture global dimensions (used by statemanager for example)
var fGM = {
	x : 0,
	y : 0,
	reachedBottom : false,
	distanceToBottom : 0,
	capture : function(e) {
		fGM.x = e.pageX;
		fGM.y = e.pageY;
		fGM.distanceToBottom = $(window).height() - e.pageY;
		
		//hide footer
		var opacity = (fGM.distanceToBottom - 100) / 100;
		var distance = (fGM.distanceToBottom - 140);
		
		if(fGM.distanceToBottom <= 40) {
			fGM.reachedBottom = true;
			$('#footerAll').animate({bottom: "0"}, 200);
		}
		else if ((fGM.reachedBottom == false) && (fGM.x <= 1100)) {
			if(fGM.distanceToBottom < 140) {
				$('#footerAll').stop();
				$('#footerAll').css("bottom", distance);
				//$('#footerAll').animate({bottom: distance}, 100);
			}
		}
		
		if(fGM.distanceToBottom > 140) {
			fGM.reachedBottom = false;
		}
		
		if(fGM.x > 1100) {
			$('#footerAll').animate({bottom: "0"}, 200);
		}
		
		
	}
}



var fUnselectable = {
	enable : function(e) {
		var e = e ? e : window.event;

		if (e.button != 1) {
			if (e.target) {
				var targer = e.target;
			} else if (e.srcElement) {
				var targer = e.srcElement;
			}

			var targetTag = targer.tagName.toLowerCase();
			if ((targetTag != "input") && (targetTag != "textarea")) {
				return false;
			}
		}
	},

	disable : function () {
		return true;
	}
}


// -------- Session Object -----
var fSession = {
	//contains instance names which contain 
	// .editAs - whether the instance is being editted as Obj 0 or Inst 1 // this is populate with fFooter
	// .state - the remembered state of the instance //this is first prepopulated with jO.load 
	// .editStatesAs - 0 is one, 1 is all // this is first prepopulated with jO.load 
	// .changed = 0 or 1 
}


// -------- Server Object -----
// used to interact with the backend
var fServer = {
	save : function() {
		
	},
	load : function() {
		
	}
}

// -------- JSON Object -----
// this section contains the JSON data objects and instances
var jO = {
	jData : null,
	load : function (whatToLoad, type) {
		//type = can be either 'file' or 'json'
		ref = this;
		
		//clear jData
		delete	jO.jData;
		jO.jData = new Object;
		
		//file loading
		if(type == 'file') {
			$.getJSON(whatToLoad, function(data){
				jO.jData = data;
				fWorkspace.initAfterLoad();
			});
			
		}
		else if(type == 'json') {
			//jO.jData = $.evalJSON(whatToLoad);
			//alert(whatToLoad);
			jQuery.extend(true, jO.jData, $.evalJSON(whatToLoad));
			
			fWorkspace.initAfterLoad();
		}
			
		
		
	},
	tr : function(item) { //removes _ref string from element references
		item = item.replace(/_.*/, '');
		return (item);
	},
	getAvailableId : function(type,objName) {
		var lookWhere = null;
		var idName = null;
		
		if(type == 'idea') { lookWhere = jO.jData.ideas[objName]; idName = "";}
		else if(type == 'inst') { lookWhere = jO.jData.instances; idName = "ins";}
		else if(type == 'txt') { lookWhere = jO.jData.elements; idName = "t";}
		else if(type == 'form') { lookWhere = jO.jData.elements; idName = "f";}
		else if(type == 'obj') { lookWhere = jO.jData.objects; idName = "obj";}
		else if(type == 'page') { lookWhere = jO.jData.pages; idName = "page";}
		
		var availableId = 0;
		for (i=1;i < 100000;i++) {
			if (idName + i in lookWhere) {}
			else { availableId = idName + i; break;	}
		}
		return(availableId);
	},
	getAvailableStateId : function(inst) {
		var availableId = 0;
		for (i=1;i < 100000;i++) {
			if (inst == "fWorkspace") { availableId = "s1"; break; }
			else if (jO.jData.instances[inst] == undefined) { availableId = "s1"; break; }
			else if ("s" + i in jO.jData.objects[jO.jData.instances[inst].of].states) {}
			else { availableId = "s" + i; break;	}
		}
		return(availableId);
	},
	getInstancesOfObj : function(objId, options) {
		//gets and returns ALL or WORKSPACE instances belonging to an object 
		// options can be "all" or "workspace"
		var returnItems = new Array();
		if (options.type == "all") {
			for (items in jO.jData.objects[objId].allInstances) {
				returnItems.push(items);
			}
		}
		else if (options.type == "workspace") {
			for (items in jO.jData.objects[objId].allInstances) {
				if ( $("#" + items).length > 0 ) { //test if exists on workspace
					returnItems.push(items);
				}
			}
		}
		return(returnItems);
	},
	getLastPageId : function() {
		lastPageId = 0;
		for (items in jO.jData.pages) {	lastPageId = items; }
		return(lastPageId);
	},
	countObjProperties : function() {
		i = 0; for (items in jO.jData.pages) {	i++; } return i;
	},
	jsonToText : function() {
			//var myJSONText = JSON.stringify(this.jData);
			var myJSONText = $.toJSON(this.jData);
			
			//format
			myJSONText = myJSONText.replace(/{/g, '{\n')
			myJSONText = myJSONText.replace(/}/g, '}\n')
			myJSONText = myJSONText.replace(/,/g, ',\n')
			var lines;
			var newlines;
			var frontSpacer = 0;
			lines=myJSONText.split("\n");
			myJSONText = "";
			for(var i=0; i<lines.length; i++) {
				//with fronspacer generate newline & append
				var tabs = "";
				for(var j=0; j<frontSpacer; j++) { tabs += "\t"; }
				newlines = tabs + lines[i] + "\n";
				newlines = newlines.replace(/\t}/, '}');
				myJSONText += newlines;
				
				//foreach open brackets ++
				if (lines[i].indexOf("{") != "-1") { frontSpacer++; } 
				//foreach closed bracket --
				if (lines[i].indexOf("}") != "-1") { frontSpacer--; } 
			}
			
			return(myJSONText);
	},
	update : function(instance, options) {
		//updates either object or instance
		// instance is a string name of an instance to be updated
		// options is an object whose properties can be
		// options.type "instance", "object" or undefined (to use the fSession editAs property)
		// options.x,y,w,h and whose values are numbers 
		// options.xs, .ys are x,y coordinates but are summed to existing values
		// options can also be contents or events TODO

		var instRef = jO.jData.instances[jO.tr(instance)];
		var objRef = jO.jData.objects[jO.jData.instances[jO.tr(instance)].of];
		statesToEdit = new Array(); // this will hold all states to be edited
		
		//determine which statesToEdit
		//all states
		if (fSession[fSel.nInst].editStatesAs == 1) { 
			for (eachState in instRef.states) {
				if(options.type == "instance")    { statesToEdit.push(instRef.states[eachState]); }
				else if(options.type == "object") { statesToEdit.push(objRef.states[eachState]); }
				else { 
					//determine instance or object from fSession
					if (fSession[instance].editAs == 0) { statesToEdit.push(objRef.states[eachState]); }
					else {statesToEdit.push(instRef.states[eachState]); }
				}
			}
		}
		//one
		else {
			if(options.type == "instance")    { statesToEdit.push(instRef.states[fSession[jO.tr(instance)].state]); }
			else if(options.type == "object") { statesToEdit.push(objRef.states[fSession[jO.tr(instance)].state]); }
			else {
				//determine instance or object from fSession
				if (fSession[jO.tr(instance)].editAs == 0) { statesToEdit.push(objRef.states[fSession[jO.tr(instance)].state]); }
				else {
					statesToEdit.push(instRef.states[fSession[jO.tr(instance)].state]); 
					//force inheritance
				}
			}
		}
		
		//loop through all statesToEdit and make the different type of edits
		for (i=0;statesToEdit.length > i;i++ ) {
			//alert("x:" + options.y + " y:" + options.x + " h:" +options.h + " w:" + options.w)
			if (options.x != undefined) { statesToEdit[i].x = options.x }
			if (options.y != undefined) { statesToEdit[i].y = options.y }
			if (options.xs != undefined) { statesToEdit[i].x += options.xs }				
			if (options.ys != undefined) { statesToEdit[i].y += options.ys }				
			if (options.w != undefined) { statesToEdit[i].w = options.w; }
			if (options.h != undefined) { statesToEdit[i].h = options.h; }
			if (options.iPos != undefined) { statesToEdit[i].iPos = options.iPos; }
			if (options.iSize != undefined) { statesToEdit[i].iSize = options.iSize; }
			if (options.iContents != undefined) { statesToEdit[i].iContents = options.iContents; }
			if (options.iEvents != undefined) {	statesToEdit[i].iEvents = options.iEvents; }
			if (options.iPriority != undefined) { statesToEdit[i].iPriority = options.iPriority;}
		}
		
		//set fSession.changed to 1 (need instance name)
		if(options.type == "instance")    {  
			fSession[jO.tr(instance)].changed = 1;
		}
		else if(options.type == "object") { 
		for (items in objRef.allInstances)
			fSession[items].changed = 1;
			fFooter.instRedraw();
		}
		

	},
	updateElements : function(element, options) {
		//updates either object or instance
		// instance is a string name of an instance to be updated
		// options is an object whose properties can be
		// options.type "instance", "object" or undefined (to use the fSession editAs property)
		// options.x,y,w,h and whose values are numbers 
		// options.xs, .ys are x,y coordinates but are summed to existing values
		// options can also be contents or events TODO
		var elementRef = jO.jData.elements[element];
		var insName = $("#"+element).parent().attr("id");
		var insRef = jO.jData.instances[insName];

		//alert("x:" + options.x + " y:" + options.x + " h:" +options.h + " w:" + options.w)
		if (options.x != undefined) { elementRef.x = options.x }
		if (options.y != undefined) { elementRef.y = options.y }
		if (options.xs != undefined) { elementRef.x += options.xs }				
		if (options.ys != undefined) { elementRef.y += options.ys }				
		if (options.w != undefined) { elementRef.w = options.w; }
		if (options.h != undefined) { elementRef.h = options.h; }
		if (options.txt != undefined) {	elementRef.txt = options.txt; }
	},
	createObj : function(name,x,y,width,height) {
		//alert('name:' + name + ', x:' + x + ', y:' + y + ', width:' + width + ', height:' + height);
		//determine which Id to give the object
		newObjId = jO.getAvailableId('obj');
		//create it
		jO.jData.objects[newObjId] = new Object();
		jO.jData.objects[newObjId].name = name;
		jO.jData.objects[newObjId].i = "1";
		jO.jData.objects[newObjId].defState = "s1";
		jO.jData.objects[newObjId].defIdea = "1";
		jO.jData.objects[newObjId].allInstances = new Object;
		jO.jData.objects[newObjId].states = new Object;

		//create state
		jO.jData.objects[newObjId].states.s1 = new Object;
		jO.jData.objects[newObjId].states.s1.contains = new Object;
		jO.jData.objects[newObjId].states.s1.sName = "State Name";
		jO.jData.objects[newObjId].states.s1.x = x;
		jO.jData.objects[newObjId].states.s1.y = y;
		jO.jData.objects[newObjId].states.s1.w = width;
		jO.jData.objects[newObjId].states.s1.h = height;
		jO.jData.objects[newObjId].states.s1['z-index'] = 1;
		
		return (newObjId);
	},
	createTxt : function(txt,x,y,width,height) {
		newTxtId = jO.getAvailableId('txt');
		
		//create it
		jO.jData.elements[newTxtId] = new Object();
		jO.jData.elements[newTxtId].txt = txt;
		jO.jData.elements[newTxtId].x = x;
		jO.jData.elements[newTxtId].y = y;
		jO.jData.elements[newTxtId].w = width;
		jO.jData.elements[newTxtId].h = height;
		
		return (newTxtId);
	},
	createForm : function(formtype,x,y,width,height) {
		newFormId = jO.getAvailableId('form');
		
		if(x == undefined) { x = 10;}
		if(y == undefined) { y = 10;}
		
		//create it
		jO.jData.elements[newFormId] = new Object();
		jO.jData.elements[newFormId].type = formtype;
		jO.jData.elements[newFormId].x = x;
		jO.jData.elements[newFormId].y = y;
		jO.jData.elements[newFormId].w = width;
		jO.jData.elements[newFormId].h = height;
		
		return (newFormId);
	},
	instantiate : function (ID,instanceId,state,parentType) {
		//what object (or text), instatiate in which instances, in what state, and update parent object 0 or instance 1
		//alert(ID + ":" + instanceId + ":" + state);
		if(parentType == undefined) {
			if (fSel.editAs == 0) {parentType = 0;}
			else {parentType = 1;}
		}
		
		// FOR INSTANCES
		if (ID.match("obj") != null) {
		
			//grab available ID
			newInstId = jO.getAvailableId('inst');
			
			//create instance
			var addWhereRef = jO.jData.instances;
			addWhereRef[newInstId] = new Object;
			addWhereRef[newInstId].of = ID;
			addWhereRef[newInstId].states = new Object;
			addWhereRef[newInstId].p = instanceId; if(instanceId == "fWorkspace") {addWhereRef[newInstId].p = fPanelPages.selectedPageId;}
			addWhereRef[newInstId].ps = state;
			
			//recreate states in instace as they are in the object
			for (states in jO.jData.objects[ID].states) {
				jO.jData.instances[newInstId].states[states] = new Object;

				//copy properites from object					
				iPos = 1
				iSize = 1;
				iContents = 1;
				iEvents = 1;
				iPriority = 1;
				x = jO.jData.objects[ID].states[states].x;
				y = jO.jData.objects[ID].states[states].y;
				w = jO.jData.objects[ID].states[states].w;
				h = jO.jData.objects[ID].states[states].h;

				jO.jData.instances[newInstId].states[states].iPos = iPos;
				jO.jData.instances[newInstId].states[states].iSize = iSize;
				jO.jData.instances[newInstId].states[states].iContents = iContents;
				jO.jData.instances[newInstId].states[states].iEvents = iEvents;
				jO.jData.instances[newInstId].states[states].iPriority = iPriority;
				jO.jData.instances[newInstId].states[states].contains = new Object;
				jO.jData.instances[newInstId].states[states].x = x;
				jO.jData.instances[newInstId].states[states].y = y;
				jO.jData.instances[newInstId].states[states].w = w;
				jO.jData.instances[newInstId].states[states].h = h;
			}
			
			//create fSession instance state
			fSession[newInstId] = new Object;
			fSession[newInstId].state = "s1";
			fSession[newInstId].editStatesAs = 0; //default edit OneState
			//update allInstances reference inside Object
			jO.jData.objects[ID].allInstances[newInstId] = 1;
		}
		
		// FOR TXT
		if (ID.match("t") != null) {
			newInstId = ID;
		}
		
		// FOR FORMS
		if (ID.match("f") != null) {
			newInstId = ID;
		}
		
		
		//if fWorkspace update pages
		if (instanceId == "fWorkspace") {
			jO.jData.pages[fPanelPages.selectedPageId].contains[newInstId] = "";
		}
		// update parent instances or object
		else {
			if (parentType == 0) {
				jO.jData.objects[fSel.nObj].states[state].contains[newInstId] = "";
			}
			else {
				//alert(instanceId + ":" + state);
				jO.jData.instances[jO.tr(instanceId)].states[state].contains[newInstId] = "";
			}
		}
		
		return(newInstId);
	},
	copyInstance : function(from,to) {
		
	},
	copyObject : function(what) {
		//determine which Id to give the object and create it
		newObjId = jO.getAvailableId('obj');
		jO.jData.objects[newObjId] = new Object;
		
		//copy 
		jQuery.extend(true, jO.jData.objects[newObjId], jO.jData.objects[what]);
		
		for (items in jO.jData.objects[newObjId].allInstances) {
			delete jO.jData.objects[newObjId].allInstances[items];
		};
		
		return (newObjId);
		
		
	},
	copyText : function(from,to) {
		
	},
	createState : function(instance) {
		// instance, is used to figure out where to add the new state
		if (instance == undefined) {
			instance = fSel.nInst; //use selected instance
		}
		
		//grab a new possible state name
		var newState = this.getAvailableStateId(instance);
		var instRef = jO.jData.instances[instance];
		var objRef = jO.jData.objects[jO.jData.instances[instance].of];
		
		//create object state if does not already exist
		if (objRef.states[newState] == undefined) {
			objRef.states[newState] = new Object;
			objRef.states[newState].contains = new Object;
			objRef.states[newState].sName = "State Name " + newState.replace("s","");
			
			// and copy properties from currently selected object if not creating the state for the first time (s1)
			if (newState != "s1") {
				objRef.states[newState].x = fSel.jObj.states[fSession[fSel.nInst].state].x;
				objRef.states[newState].y = fSel.jObj.states[fSession[fSel.nInst].state].y;
				objRef.states[newState].w = fSel.jObj.states[fSession[fSel.nInst].state].w;
				objRef.states[newState].h = fSel.jObj.states[fSession[fSel.nInst].state].h;
				objRef.states[newState]['z-index'] = fSel.jObj.states[fSession[fSel.nInst].state]['z-index'];
				//populate contents as well from objects only
				for (items in fSel.jObj.states[fSession[fSel.nInst].state].contains) {
					//objects
					if(items.match("ins")) {
						newInstanceName = jO.instantiate(jO.jData.instances[items].of, fSel.nInst, newState, 0);
						//todo this has to happen recursively
					}
					//txt
					else if (items.match("t")) {
						//newTxtId = jO.instantiate(jO.jData.elements[items]);
						tref = jO.jData.elements[items];
						newTxtId = jO.createTxt(tref.txt,tref.x,tref.y,tref.w,tref.h);
						//update state contains
						objRef.states[newState].contains[newTxtId] = "";
					}
				}
				//TODO populate events
			}
		}
		
		//create state in all instances belonging to this object (need to keep them in sync)
		//generate a list of instances which need updating
		instancesToUpdate = new Array();
		instancesToUpdate = this.getInstancesOfObj(instRef.of,{type: "all"});

		// if no instances belong to the object this means it's the first time, so add the instance as a valid one to update
		if (instancesToUpdate.length == 0) {
			instancesToUpdate.push(instance);
		}
		
		//create blank states from the instancesToUpdate array, with inheritance, size and position from previous state
		for (i=0;i<instancesToUpdate.length;i++) {
			//check if newState (determined from objects) does not already exist in instaces. As sometimes obj / inst states get out of syn during idea creation, and it's important not to overwrite existing states
			if (!jO.jData.instances[instancesToUpdate[i]].states.hasOwnProperty(newState)) {
				jO.jData.instances[instancesToUpdate[i]].states[newState] = new Object;
				jO.jData.instances[instancesToUpdate[i]].states[newState].iPos = jO.jData.instances[fSel.nInst].states[fSession[fSel.nInst].state].iPos;
				jO.jData.instances[instancesToUpdate[i]].states[newState].iSize = jO.jData.instances[fSel.nInst].states[fSession[fSel.nInst].state].iSize;
				jO.jData.instances[instancesToUpdate[i]].states[newState].iContents = jO.jData.instances[fSel.nInst].states[fSession[fSel.nInst].state].iContents;
				jO.jData.instances[instancesToUpdate[i]].states[newState].iEvents = jO.jData.instances[fSel.nInst].states[fSession[fSel.nInst].state].iEvents;
				jO.jData.instances[instancesToUpdate[i]].states[newState].iPriority = jO.jData.instances[fSel.nInst].states[fSession[fSel.nInst].state].iPriority;
				jO.jData.instances[instancesToUpdate[i]].states[newState].contains = new Object;
				jO.jData.instances[instancesToUpdate[i]].states[newState].x = jO.jData.instances[fSel.nInst].states[fSession[fSel.nInst].state].x;
				jO.jData.instances[instancesToUpdate[i]].states[newState].y = jO.jData.instances[fSel.nInst].states[fSession[fSel.nInst].state].y;
				jO.jData.instances[instancesToUpdate[i]].states[newState].w = jO.jData.instances[fSel.nInst].states[fSession[fSel.nInst].state].w;
				jO.jData.instances[instancesToUpdate[i]].states[newState].h = jO.jData.instances[fSel.nInst].states[fSession[fSel.nInst].state].h;
			}
		}
		
		return(newState);
	},
	updateAddPage : function(what) {
		
	},
	createIdea: function(instance){
		//CREATING FOR FIRST TIME
		objName = jO.jData.instances[instance].of;
		if(!jO.jData.ideas.hasOwnProperty(objName)) {
			//create obj
			jO.jData.ideas[objName] = new Object;
			
			//create idea
			newIdeaId = jO.getAvailableId('idea',objName);
			jO.jData.ideas[objName][newIdeaId] = new Object;
			
			//copy 
			jQuery.extend(true, jO.jData.ideas[objName][newIdeaId], jO.jData.objects[objName]);
		}
		
		//create idea
		newIdeaId = jO.getAvailableId('idea',objName);
		jO.jData.ideas[objName][newIdeaId] = new Object;
		
		//copy 
		jQuery.extend(true, jO.jData.ideas[objName][newIdeaId], jO.jData.objects[objName]);
		
		//FOREACH STATE
		for (state in jO.jData.ideas[objName][newIdeaId].states) {
			//clear contains
			delete jO.jData.ideas[objName][newIdeaId].states[state].contains;
			jO.jData.ideas[objName][newIdeaId].states[state].contains = new Object;
		}
		
		return(newIdeaId);
		
	}
};


// -------- ClibBoard Manager Popup Object -----
// this section contains the clibboard objects
var fCBManager = {
	opened : false,
	pasteAs: "", //master or instance
	openedPaste : false,
	mouseover : false, //checked by keyReleased function to see if the mouse is still not over, before hiding it
	mode : "empty", //wholepage, multiple instances, multiple objects, instance, objects
	states : "", //one state or all 
	instances : [], //array with instance names to copy
	title : "", // display title
	displayManager : function() {
		if (this.opened == false) {
			var setx = 0;
			var sety = 0;

			[setx,sety] = fWorkspace.positionManager('fCBManager');
				
			//reposition so that cursor is closer to the state selection area
			setx -= 130;
			sety -= 40;
			
			$("#fCBManager").css({left: setx});
			$("#fCBManager").css({top: sety});
			
			//set title
			$("#fCBTitle").html(this.title);
			
			//set mouseover 
			this.mouseover = true;
			
			//update 
			this.redraw();
		
			//assign hiding ... if not holding down C, hide on mouseleave
			//$("#fCBManager").bind("mouseleave", function(e){ if(cPressed == false) {fCBManager.hideManager(); this.mouseover=false;}}); 
			//$("#fCBManager").bind("mouseenter", function(e){ this.mouseover=true;}); 
			
			//reset all
			$(".fCBContents").hide();
			
			//display types
			//CB Empty
			if(this.mode == "empty") {
				$("#CBEmpty").show();
			}
			else if(this.mode == "instance") {
				$("#CBInstance").show();
			}
			else if(this.mode == "text") {
				$("#CBText").show();
			}
			else if(this.mode == "form") {
				$("#CBForm").show();
			}
			else if(this.mode == "page") {
				$("#CBPage").show();
				$("#CBPage > div").html("Page: " + this.instances[0]);
			}
			

			
			//update opened state
			this.opened = true;
		}
	},
	displayPasteManager : function() {
		if (this.openedPaste == false) {
			var setx = 0;
			var sety = 0;

			[setx,sety] = fWorkspace.positionManager('fPManager');
				
			//reposition so that cursor is closer to the state selection area
			setx -= 130;
			sety -= 40;
			
			$("#fPManager").css({left: setx});
			$("#fPManager").css({top: sety});
			
			//set mouseover 
			this.mouseover = true;
			
			//assign hiding ... if not holding down C, hide on mouseleave
			$("#fPManager").bind("mouseleave", function(e){ fCBManager.hidePasteManager(); this.mouseover=false;}); 
			$("#fPManager").bind("mouseenter", function(e){ this.mouseover=true;}); 
			
			
			//SHOW HIDE buttons
			if(this.mode == "instance") {
				$("#buttonNewMaster").show();
				$("#buttonNewInstance").show();
				//set default paste as
				this.pasteAsInstance();	
			}
			else if (this.mode == "text") {
				$("#buttonNewMaster").hide();
				$("#buttonNewInstance").hide();
				//update "as" field
				$("#fPasteMode").html("text");
			}
			
			
			
			//PASTE INTO
			//workspace
			if (fSel.sI[0].match("fWorkspace")) {
				$("#fCBInto1").html("Workspace");
				$("#fCBInto2").html("");
			}
			//instances
			else {
				//update first part of paste into
				if (fSel.editStatesAs == 0) {
					$("#fCBInto1").html("One State of");
				}
				else {
					$("#fCBInto1").html("All States of");
				}
				
				//update second part of paste into
				if (fSel.editAs == 0) { //for edit as object
					$("#fCBInto2").html(jO.jData.objects[fSel.nObj].name);
					$("#fCBInto2").removeClass("fTOrange");
					$("#fCBInto2").addClass("fTBlue");
				}
				else {
					$("#fCBInto2").html(jO.jData.objects[fSel.nObj].name);
					$("#fCBInto2").removeClass("fTBlue");
					$("#fCBInto2").addClass("fTOrange");
				}
			}
			
			//update opened state
			this.openedPaste = true;
		}
	},
	copy : function() {
		if ((this.opened == false) && (fSel.sI.length != 0)) {
			//set copy type
			if(fSel.editAs == 0) { this.type = "object";}
			else { this.type = "instance"; }
			
				
			//copy instance names
			this.instances = fSel.sI.slice();
			
			//set mode
			if(this.instances[0].match("ins")) {
				this.mode = "instance";
				//update selected object
				this.title = "Object: " + jO.jData.objects[fSel.nObj].name;
			}
			else if(this.instances[0].match("f")) {
				this.mode = "form";
			}
			else if(this.instances[0].match("t")) {
				this.mode = "text";
			}
			else if(this.instances[0].match("fWorkspace")) {
				this.mode = "page";
				this.instances[0] = fPanelPages.rememberPageSelectedId;
			}
			
			//display
			//this.displayManager();
			
			//highlight cbMini
			$("#cbMini").animate({opacity: "0"}, 100).animate({opacity: "1"}, 500);			
			
		}
	},
	paste : function() {
		//instantiate
		//alert(this.instances[0] + ":" + jO.jData.instances[this.instances[0]].of +  ":" + fSel.sI[0] + ":" + fSession[fSel.nInst].state);
		
		//check if the selected item is on the selected page
		if(!$("#" + fSel.sI[0]).length > 0) {
			//if not, then select the workspace :)
			fSel.selectObject($("#fWorkspace"));
		}
		
		if (this.mode == "instance") {
			for (var i = 0; i < this.instances.length; i++) {
				if (fSel.sI[0].match("ins") || fSel.sI[0].match("fWorkspace")) {
					//check if trying to paste an instance into its own master object (in which case do not allow)
					if ((fSel.nObj == jO.jData.instances[this.instances[i]].of) && fSel.sI[0].match("ins")) {
						//todo display error message - cannot paste intstance into itself
						
					}
					else {
						if (this.pasteAs == "instance") {
							ID = jO.instantiate(jO.jData.instances[this.instances[i]].of, fSel.sI[0], fSession[fSel.nInst].state);
						}
						else if (this.pasteAs == "master") {
							newID = jO.copyObject(jO.jData.instances[this.instances[i]].of);
							ID = jO.instantiate(newID, fSel.sI[0], fSession[fSel.nInst].state);
						}
						//redraw Objects
						fWorkspace.redraw({type: 'page'});
						
						//reposition if overlapping
						this.indentPosition(ID);
						
						//give visual feedback that paste has occured
						this.pasteFeedback(ID);
						
						//select the newly pasted object
						fSel.selectObject(ID);
					}
				}
			}
		}
		else if (this.mode == "text") {
			for (var i = 0; i < this.instances.length; i++) {
				//create new text from existing one
				tref = jO.jData.elements[this.instances[i]];
				newTxtId = jO.createTxt(tref.txt,tref.x,tref.y,tref.w,tref.h);
				
				if (fSession[fSel.nInst] != undefined) {
					ID = jO.instantiate(newTxtId, fSel.sI[0], fSession[fSel.nInst].state);
				}
				else {
					ID = jO.instantiate(newTxtId, fSel.sI[0]);
				}
				
				fWorkspace.redraw({type: 'page'});
				
				//give visual feedback that paste has occured
				this.pasteFeedback(newTxtId);
			}
		}
		else if (this.mode == "form") {
			for (var i = 0; i < this.instances.length; i++) {
				//create new text from existing one
				tref = jO.jData.elements[this.instances[i]];
				newTxtId = jO.createForm(tref.type,tref.x,tref.y,tref.w,tref.h);

				if (fSession[fSel.nInst] != undefined) {
					ID = jO.instantiate(newTxtId, fSel.sI[0], fSession[fSel.nInst].state);
				}
				else {
					ID = jO.instantiate(newTxtId, fSel.sI[0]);
				}
				
				fWorkspace.redraw({type: 'page'});
						
				//give visual feedback that paste has occured
				this.pasteFeedback(newTxtId);
			}
		}
	},
	pasteAsMaster : function() {
		//clear button Instance
		var imgsrc = $("#buttonNewInstance").attr("src");
		imgsrc = imgsrc.replace("_on","_off");
		$("#buttonNewInstance").attr("src",imgsrc);
		
		//set Master
		imgsrc = $("#buttonNewMaster").attr("src");
		imgsrc = imgsrc.replace(/(_over|_off)/,"_on");
		$("#buttonNewMaster").attr("src",imgsrc);
		
		//update "as" field
		$("#fPasteMode").html("master");
		
		this.pasteAs = "master";
	},
	pasteAsInstance : function() {
		//clear button Master
		var imgsrc = $("#buttonNewMaster").attr("src");
		imgsrc = imgsrc.replace("_on","_off");
		$("#buttonNewMaster").attr("src",imgsrc);
		
		//set Instance
		imgsrc = $("#buttonNewInstance").attr("src");
		imgsrc = imgsrc.replace(/(_over|_off)/,"_on");
		$("#buttonNewInstance").attr("src",imgsrc);
		
		//update "as" field
		$("#fPasteMode").html("instance");
		
		this.pasteAs = "instance";
	},
	pasteFeedback : function(what) {
		$("#" + what).prepend('<div class="pasteFillInst" id="pasteFill"></div>');
		$("#pasteFill").animate({
			"opacity": "0"
		}, {
			duration: "fast",
			complete: function(){
				$("#pasteFill").remove();
			}
		});
	},
	indentPosition : function(what) {
		var reposition = false;
		howmuch = 0;
		$("#" +what).siblings(".fObject").each(function(i){
			//detect if to reposition the newly pasted object
			// check if the ID has a position the same as any of the siblings
			//alert($("#" +what).css("left") + ":" + $(this).css("left"));
			if((parseInt($("#" +what).css("left")) + (howmuch * 10) ) == parseInt($(this).css("left"))) {
				reposition = true;
				howmuch++;
				
				//turn off positional inheritance of all items on a page
				jO.update($(this).attr("id"), {type: "instance",iPos: 0});
			}
		});
	
		if(reposition == true) {
			//update workspace
			$("#" + what).css({left: parseInt($("#" + what).css("left")) + (10 * howmuch)});
			$("#" + what).css({top: parseInt($("#" + what).css("top")) + (10 * howmuch)});
			
			//updata jData
			if (fCBManager.pasteAs == "master") { //if 0 editing as Object
				//update JSON + Force inheritance of iPos = 1
				jO.update(what, {
					type: "object",
					x: $("#" + what).position().left,
					y: $("#" + what).position().top,
					iPos: 1
				});
			}
			else { //else editing as Instance
				//update JSON + Force inheritance of iPos = 0
				jO.update(what, {
					type: "instance",
					x: $("#" + what).position().left,
					y: $("#" + what).position().top,
					iPos: 0
				});
			}
		}
	},
	hideManager : function() {
		if (this.opened == true) {
			$("#fCBManager").fadeOut(100);
			this.opened = false;
		}
	},
	hidePasteManager : function() {
		if (this.openedPaste == true) {
			$("#fPManager").fadeOut(100);
			this.openedPaste = false;
		}
	},
	redraw : function() {

	}
}






// -------- IdeaManager Popup Object -----
// this section contains the state manager
var fIdeaManager = {
	opened : false,
	selIdea : "1",
	displayManager : function() {
		if ((this.opened == false) && (fSel.sI[0].match("ins"))) {
			var setx = 0;
			var sety = 0;
			var rememberedState = fSel.jObj.states[fSession[fSel.nInst].state].sName;
			
			[setx,sety] = fWorkspace.positionManager('fIdeaManager');
				
			//reposition so that cursor is closer to the state selection area
			setx -= 40;
			sety -= 60;
			
			$("#fIdeaManager").css({left: setx});
			$("#fIdeaManager").css({top: sety});
			
			//update 
			this.redraw();
		
			//update opened state
			this.opened = true;
		}
	},
	hideManager : function() {
		if (this.opened == true) {
			$("#fIdeaManager").fadeOut(100);
			this.opened = false;
		}
	},
	addIdea: function(){
		var newIdea = jO.createIdea(fSel.nInst);
		this.redraw();
		this.chooseIdea(newIdea);
		
		//fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		fWorkspace.redraw({type: 'page'}); 
	},
	redraw : function() {
		//clear all ideas
		$(".fIMIdeas").children().remove();
		
		//preload number of ideas
		// if no ideas
		if (!jO.jData.ideas.hasOwnProperty(fSel.nObj)) {
			$(".fIMIdeas").append('<div class="fIMIdea" id="i1"><a href="#" onmouseover="rollOver(this);" onmouseout="rollOut(this);"><img src="engine/images/b_state_off.png" border="0" title="Idea"></a><input type="radio" name="fStartingIdea"></div>');
		}
		else {
			var i = 1;
			for (items in jO.jData.ideas[fSel.nObj]) {
				$(".fIMIdeas").append('<div class="fIMIdea" id="i' + i + '"><a href="#" onclick="fIdeaManager.chooseIdea(\'' + i + '\')" onmouseover="rollOver(this);" onmouseout="rollOut(this);"><img src="engine/images/b_state_off.png" border="0" title="Idea"></a><input type="radio" name="fStartingIdea" onclick="fIdeaManager.chooseDefaultIdea(\'' + i + '\');"></div>');
				i++;
			}
			
		}
		//get current idea number
		this.selIdea = jO.jData.objects[fSel.nObj].i;
		
		//select the currently selected idea
		var imgsrc = $("#i" + this.selIdea + " img").attr("src");
		imgsrc = imgsrc.replace("_off", "_on");
		$("#i" + this.selIdea + " img").attr("src", imgsrc);
		
		//update State Text
		$("#fIdeaNumber").text(this.selIdea);
		
		//set default idea (grab from object)
		var defIdea = fSel.jObj.defIdea;
		$("#i" + defIdea + " input").attr("checked", true);
	},
	chooseIdea : function(which) {
		//copy current object to temporary one 
		tempObject = new Object;
		jQuery.extend(true, tempObject, jO.jData.objects[fSel.nObj]);
		
		//copy from chosen ideas to current object
		delete jO.jData.objects[fSel.nObj];
		jO.jData.objects[fSel.nObj] = new Object;
		oRef = jO.jData.objects[fSel.nObj];
		jQuery.extend(true, oRef, jO.jData.ideas[fSel.nObj][which]);
		
		//copy temporary to ideas
		delete oRef[tempObject.i];
		oRef[tempObject.i] = new Object;
		jQuery.extend(true, jO.jData.ideas[fSel.nObj][tempObject.i], tempObject);
		
		//keep some object properties up to date
		delete oRef.allInstances;
		oRef.allInstances = new Object;
		jQuery.extend(true, oRef.allInstances, tempObject.allInstances); 

		//update a number of important properties
		oRef.name = tempObject.name;
		oRef.defState = tempObject.defState;
		oRef.defIdea = tempObject.defIdea;
		
		//delete temporary
		delete tempObject;
		
		//update object selects
		jO.jData.objects[fSel.nObj].i = which;
		
		//downshift a state possibly, if it doesn't exist
		if(!jO.jData.objects[fSel.nObj].states.hasOwnProperty(fSession[fSel.nInst].state)) {
			fSession[fSel.nInst].state = "s1";
		}
		
		//redraw
		this.redraw();
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		
		//reselect (as objects were deleted and references lost)
		fSel.selectObject(fSel.nInst);
	},
	chooseDefaultIdea : function(whichIdea) {
		//update selected object's defaultState
		fSel.jObj.defIdea = whichIdea;
	},
}



// -------- StateManager Popup Object -----
// this section contains the state manager
var fStateManager = {
	opened : false,
	displayManager : function() {
		if ((this.opened == false) && (fSel.sI[0].match("ins"))) {
			var setx = 0;
			var sety = 0;
			var rememberedState = fSel.jObj.states[fSession[fSel.nInst].state].sName;
			
			[setx,sety] = fWorkspace.positionManager('fStateManager');
			
			//reposition so that cursor is closer to the state selection area
			setx -= 130;
			sety -= 40;
			
			$("#fStateManager").css({left: setx});
			$("#fStateManager").css({top: sety});
			
			//update fStateManager
			this.redraw();
		
			//update opened state
			this.opened = true;
		}
	},
	hoverOn : function(state) {
		if (state == "all") {
			$("#fSMStateName").text("All States");
		}	
		else {
			$("#fSMStateName").text(fSel.jObj.states[state].sName);
		}	
	},
	hoverOff : function() {
		if (fSession[fSel.nInst].editStatesAs == 1) {
			$("#fSMStateName").text("All States");
		}
		else {
			$("#fSMStateName").text(fSel.jObj.states[fSession[fSel.nInst].state].sName);
		}
	},
	redraw : function() {
		//clear all states
		$(".fSMStates").children().remove();
		
		//clear editAll
		imgsrc = $("#editAll").attr("src");
		imgsrc = imgsrc.replace(/(_over|_on)/,"_off");
		$("#editAll").attr("src",imgsrc);
			
		//preload number of states
		var i = 0;
		for (items in jO.jData.objects[fSel.nObj].states) {
			$(".fSMStates").append('<div class="fSMState" id="' + items + '"><a href="#" onclick="fStateManager.chooseState(\'' + items + '\')" onmouseover="rollOver(this); fStateManager.hoverOn(\'' + items + '\')" onmouseout="rollOut(this); fStateManager.hoverOff();"><img src="engine/images/b_state_off.png" border="0" title="State"></a><input type="radio" name="fStartingState" onclick="fStateManager.chooseDefaultState(\'' + items + '\');"></div>');
		}
		
		
		// if editAll true
		if (fSession[fSel.nInst].editStatesAs == 1) {
			//set editAll
			imgsrc = $("#editAll").attr("src");
			imgsrc = imgsrc.replace(/(_over|_off)/, "_on");
			$("#editAll").attr("src", imgsrc);
			
			//update State Text
			$("#fSMStateName").text("All States");
		}
		else {
			var imgsrc = $("#" + fSession[jO.tr(fSel.sI[0])].state + " img").attr("src");
			imgsrc = imgsrc.replace("_off", "_on");
			$("#" + fSession[jO.tr(fSel.sI[0])].state + " img").attr("src", imgsrc);
			
			//update State Text
			$("#fSMStateName").text(fSel.jObj.states[fSession[jO.tr(fSel.nInst)].state].sName);
		}
		
		//set default state (grab from object)
		var defState = fSel.jObj.defState;
		$("#" + defState + " input").attr("checked", true)

	},
	hideManager : function() {
		if (this.opened == true) {
			$("#fStateManager").fadeOut(100);
			this.opened = false;
		}
	},
	addState : function() {
		var newState = jO.createState(fSel.nInst);
		this.redraw();
		this.chooseState(newState);
		
	},
	removeState : function() {
		
	},
	chooseState : function(whichState) {
		//update selected state in fSession
		fSession[fSel.nInst].state = whichState;
		
		//redraw Objects
		fWorkspace.redraw({type: 'object',item : fSel.nObj}); 
		
		// no longer edit all
		this.editOneState();
		
		//update footer
		fFooter.redrawFooter();
		
	},
	chooseDefaultState : function(whichState) {
		//update selected object's defaultState
		fSel.jObj.defState = whichState;
	},
	editOneState : function() {
		//update fSession
		fSession[fSel.nInst].editStatesAs = 0;
		this.redraw();
	},
	editAllStates : function() {
		//update fSession
		fSession[fSel.nInst].editStatesAs = 1;
		this.redraw();
	}
}





// -------- Form Manager Popup Object -----
// this section contains the state manager
var fFormManager = {
	opened : false,
	displayManager : function() {
		if (this.opened == false) {
			var setx = 0;
			var sety = 0;
			
			[setx,sety] = fWorkspace.positionManager('fFormManager');
			
			//reposition so that cursor is closer to the state selection area
			setx -= 130;
			sety -= 40;
			
			$("#fFormManager").css({left: setx});
			$("#fFormManager").css({top: sety});
			
			fTools.clearIcons(); // Visually
			fTools.clearEvents(); // Eventwise
			killDrag(); // remove all dragging behaviours
			killResizable(); // remove all resizable
		
			document.getElementById("iconForm").src = "engine/images/button_form_on.gif";
		
			fSel.highlight();
			
			//update opened state
			this.opened = true;
		}
	},
	hideManager : function() {
		if (this.opened == true) {
			$("#fFormManager").fadeOut(100);
			
			toolSelect();
			
			//this.opened = false;
		}
	},
	hideWrap : function() {
		//this function only exists because of binding problems in hideManager
		fFormManager.hideManager();
		fFormManager.opened = false;
		$(window).unbind("mouseup",fFormManager.hideWrap);
	},
	addFormElement : function(formtype) {
		//create the element
		newFormId = jO.createForm(formtype);
		
		//instantiate it
		if (fSel.sI[0] != "fWorkspace") {
			newInstanceName = jO.instantiate(newFormId, fSel.sI[0], fSession[fSel.nInst].state);
			
			//force inheritance
			//if 0 editing as Object
			if (fSel.editAs == 0) {jO.update(fSel.nInst, {type: "instance",iContents: 1});}
		}
		else {
			newInstanceName = jO.instantiate(newFormId, fSel.sI[0]);
		}
		
		
		//hide
		this.hideManager();
		
		//redraw
		fWorkspace.redraw({type: 'page'});
	}
}




// -------- JSON Debugger Popup Object -----
var fDebugJson = {
	opened : false,
	triggerPressedRecently : false,
	trigger : function() {
		ref = this;
		//detect if trigger was pressed twice in less than a second
		if (ref.triggerPressedRecently == true) {
			ref.displayManager();
		}
		setTimeout("ref.triggerPressedRecently = false",500);
	} ,
	displayManager : function () {
		alert(jO.jsonToText());
		// create the menu
		if (this.opened == false) {
			this.opened = true;
			
			//make JSON visible
			$("#container").append('<div id="fTempJData"><textarea>' + jO.jsonToText() + '</textarea></div>');
		}		
	},
	hideManager : function () {
		if (this.opened == true) {
			this.opened = false;
			this.triggerPressedRecently = false;
			
			//grab the modified JSON contents and reload everything base on it
			var jsonText = $("#fTempJData textarea").val();
			jO.load(jsonText,'json');
			
			// temp stuff hide JSON
			$("#fTempJData").remove();
		}
	}
	
};


// -------- fTools Object -----
var fTools = {
	selected : null,
	selectTool : function(which) {
		
	},
	clearIcons : function() {
		document.getElementById("iconObject").src = "engine/images/button_object_off.gif";
		document.getElementById("iconSelect").src = "engine/images/button_arrow_off.gif";
		document.getElementById("iconText").src = "engine/images/button_text_off.gif";
		document.getElementById("iconForm").src = "engine/images/button_form_off.gif";
	},
	clearEvents : function() {
		$("#fWorkspace").unbind("click",fSel.selectBinding);
		$("#fWorkspace").unbind("mousemove",Draw);
	},
	crosshairOn : function() {
		for (var i = 0; i < fSel.sI.length; i++) {
			$("#" + fSel.sI[i]).removeClass("cursorMove");
		}
		$("#fWorkspace").addClass("cursorCrosshair");
	},
	crosshairOff : function() {
		for (var i = 0; i < fSel.sI.length; i++) {
			if (fSel.sI[i] != "fWorkspace") { $("#" + fSel.sI[i]).addClass("cursorMove");}
		}
		$("#fWorkspace").removeClass("cursorCrosshair");
	}
}




// -------- fWorkspace Object -----
var fWorkspace = {
	editingText : false, //if set to true, a resize does not cause a redraw
	allowSaveLabel : false,
	editingLabelInstance : null,
	allowDraw : false, //used by Draw function
	clear : function() {
		//alert('clear');
		$("#fWorkspace").children().remove();
	},
	clearStyles : function() {
		//unselect old one(s)
		//alert('clearing Styles');
		for (var i = 0; i < fSel.sI.length; i++) {
			$("#" + fSel.sI[i]).removeClass("selectedWorkspace");
			$("#" + fSel.sI[i]).removeClass("selected");
			$("#" + fSel.sI[i]).parent().removeClass("parent");
			$("#" + fSel.sI[i]).removeClass("cursorMove");
			$("#" + fSel.sI[i]).removeClass("selectedInst");
			$("#" + fSel.sI[i]).removeClass("selectedTxt");
		}
	},
	redraw : function(options){
		// takes two properties: type and item
		// type can be 'page', 'instance', 'object'
		// item is a string of instanceName or objectName
		// when a page is redrawn, it uses the currentpage
		//alert(options.type);

		attachWhereArray = new Array(); //contains parent instance references to which instances are attached to
		attachWhatArray = new Array(); //each elements contains an object with a set of instance references from within "contains"
		attachInsideArray = new Array(); //contains either 0, 1 or 2 for whether the item is coming from the master, instance or nothing

		attachWhereArray.splice(0,attachWhereArray.length); //clear each time this function is called
		attachWhatArray.splice(0,attachWhatArray.length);
		attachInsideArray.splice(0,attachInsideArray.length);
		
		////// redraw whole page
		// CLEARS & draws all instances on fWorkspace :)
		attachWhereArray.push("fWorkspace");
		attachWhatArray.push(jO.jData.pages[fPanelPages.selectedPageId].contains);			
		attachInsideArray.push(2);			
		fWorkspace.clear(); 
		
		//for each instances passed draw (for 'page')
		var i;
		for (i = 0; i < attachWhatArray.length; i += 1) {
			for (item in attachWhatArray[i]) {
				//FOR INSTANCES
				if (item.match("ins") != null) {
					//determine insideClass
					//alert(attachInsideArray[i]);
					if(attachInsideArray[i] == 0) {
						insideClass = " fInsideMaster";
					}
					else if (attachInsideArray[i] == 1) {
						insideClass = " fInsideInstance";
					}
					else {
						insideClass = "";
					}
				
					//alert(i + 'drawing: ' + item + " instlength" + $("#" + item).length + ' where:' + attachWhereArray[i]);
					objRef = jO.jData.objects[jO.jData.instances[item].of];
					//use default state
					state = jO.jData.objects[jO.jData.instances[item].of].defState;
					//use session state if exists
					if (fSession[item] != undefined) {
						state = fSession[item].state
					};
					objRefState = objRef.states[state];
					instRef = jO.jData.instances[item];
					instRefState = instRef.states[state];
					
					// grab properties from object
					var x = objRefState.x;
					var y = objRefState.y;
					var width = objRefState.w;
					var height = objRefState.h;
					
					// use instance/inheritance settings 
					if ((instRefState.iPos == 0) && instRefState.hasOwnProperty("x" && "y")) {
						x = instRefState.x;
						y = instRefState.y;
					}
					if ((instRefState.iSize == 0) && instRefState.hasOwnProperty("w" && "h")) {
						width = instRefState.w;
						height = instRefState.h;
					}
					
					// create the instance & bind events if creating for the first time (ex: PAGE CHANGES)
					inc = 0;
					while($("#" + item).length != 0) {
						inc++;
						item = item + "_" + inc;
					}
					$("#" + attachWhereArray[i]).append("<div id=\"" + item + "\" class=\"fObject" +insideClass + "\"></div>"); 
					
					// adjust properties
					$("#" + item).css({
						left: x,
						top: y,
						width: width,
						height: height
					});
					
					
					// CONTAINS 
					// if editing as object just load master object's
					var contains = false; // does the current instance have anything inside? used to determine label display 
					if (instRefState.hasOwnProperty("contains")) {
						//load contents from instance 
						var count = 0;
						for (k in instRefState.contains) 
							if (instRefState.contains.hasOwnProperty(k)) 
								count++;
						//if they have anything inside
						if (count > 0) {
							//add references to instances to the array if instances are found
							attachWhatArray.push(instRefState.contains);
							//and remember in the parent instances, in order to attach to later
							attachWhereArray.push(item);
							contains = true;
							attachInsideArray.push(1);
						}
					}
					
					if (objRefState.hasOwnProperty("contains")) {
						//load contents from object
						count = 0;
						for (k in objRefState.contains) 
							if (objRefState.contains.hasOwnProperty(k)) 
								count++;
						//if they have anything inside and inheritance is active 
						if ((count > 0) && (instRefState.iContents == 1)) {
							attachWhatArray.push(objRefState.contains);
							//and remember in the parent instances, in order to attach to later
							attachWhereArray.push(item);
							contains = true;
							attachInsideArray.push(0);
						}
					}
					
					// SHOW LABEL
					// if instance does not contain anything (and is wider than 60 pixels), display a label
					if((contains == false) && (width > minWidthForLabel)) {
						$("#" + item).append('<div class="fLabelHolder"><div class="fLabel"><span class="fLBracket">[</span> ' + objRef.name + ' <span class="fLBracket">]</span></div></div>');
						$("#" + item).find(".fLabel").bind("dblclick",function() {$(this).fEditableLabel();});
					}
					
				}
				//FOR TEXT 
				if (item.match("t") != null) {
					//determine insideClass
					if(attachInsideArray[i] == 0) {
						insideClass = " fInsideMasterText";
					}
					else if (attachInsideArray[i] == 1) {
						insideClass = " fInsideInstanceText";
					}
					else {
						insideClass = "";
					}
					
					txtRef = jO.jData.elements[item];
					
					// grab properties from object
					var x = txtRef.x;
					var y = txtRef.y;
					var width = txtRef.w;
					var height = txtRef.h;
					var txt = txtRef.txt;
					
					// create the instance & bind events if creating for the first time (ex: PAGE CHANGES)
					inc = 0;
					while($("#" + item).length != 0) {
						inc++;
						item = item + "_" + inc;
					}
					$("#" + attachWhereArray[i]).append("<div id=\"" + item + "\" class=\"fText" +insideClass + "\">" + txt + "</div>"); //unique

					//if has real txt add a different class
					if(txt != "") {
						$("#" + item).addClass("fTextHasTxt");
					}
					
					//make it editable
					$("#" + item).bind("dblclick",function() {$(this).fEditableText();});
					
					// adjust properties
					$("#" + item).css({
						left: x,
						top: y,
						width: width,
						height: height
					});
				}
				
				//FOR FORMS 
				if (item.match("f") != null) {
					//determine insideClass
					if(attachInsideArray[i] == 0) {
						insideClass = " fInsideMasterText";
					}
					else if (attachInsideArray[i] == 1) {
						insideClass = " fInsideInstanceText";
					}
					else {
						insideClass = "";
					}
					
					txtRef = jO.jData.elements[item];
					
					// grab properties from object
					var x = txtRef.x;
					var y = txtRef.y;
					var width = txtRef.w;
					var height = txtRef.h;
					var type = txtRef.type;
					
					// create the instance & bind events if creating for the first time (ex: PAGE CHANGES)
					inc = 0;
					while($("#" + item).length != 0) {
						inc++;
						item = item + "_" + inc;
					}
					
					//different types
					if(type == "if") {
						$("#" + attachWhereArray[i]).append("<input id=\"" + item + "\" class=\"fForm" + insideClass + "\" type=\"text\" readonly>"); 
					}
					if(type == "cb") {
						$("#" + attachWhereArray[i]).append("<input id=\"" + item + "\" class=\"fForm" + insideClass + "\" type=\"checkbox\">"); 
					}
					if(type == "rb") {
						$("#" + attachWhereArray[i]).append("<input id=\"" + item + "\" class=\"fForm" + insideClass + "\" type=\"radio\" readonly>"); 
					}
					if(type == "ta") {
						$("#" + attachWhereArray[i]).append("<textarea id=\"" + item + "\" class=\"fForm" + insideClass + "\" readonly/></textarea>"); 
					}
					if(type == "pm") {
						$("#" + attachWhereArray[i]).append("<select id=\"" + item + "\" class=\"fForm" + insideClass + "\" readonly></select>"); 
					}
					

					
					// adjust properties
					$("#" + item).css({
						left: x,
						top: y,
						width: width,
						height: height
					});
				}
			}
		}
		
		//make draggable / resizable selected items
		if((fSel.sI[0] != "fWorkspace") && $("#" + fSel.sI[0]).length) {
			fSel.makeDraggable(fSel.sI[0]);
			
			if (!fSel.sI[0].match("f")) {
				fSel.makeResizable(fSel.sI[0]);
			}
		}

		//visualize selected items
		fWorkspace.restyle();
		
		//reset window focus just in case
		$(window).focus();
		
	},
	initAfterLoad : function() {
		//select first page
		fPanelPages.selectedPageId = "page1";
		
		//Draw Panel Pages
		fPanelPages.draw();
		
		//populate all fSession instance with default states & 
		for (items in jO.jData.instances) {
			fSession[items] = new Object;
			fSession[items].state = jO.jData.objects[jO.jData.instances[items].of].defState;
			fSession[items].editStatesAs = 0; //by default edit OneState
		}
		
		//draw instances
		fWorkspace.redraw({type: 'page'});
	},
	restyle : function() {
		//restyles all elements on the workspace
		if (fSel.sI[0] == "fWorkspace") {
			$("#" + fSel.sI[0]).addClass("selectedWorkspace");
		}
		else {
			//style the new selection ones
			for (var i = 0; i < fSel.sI.length; i++) {
				//instances
				if (fSel.sI[i].match("ins")) {
					$("#" + fSel.sI[i]).addClass("selected");
					$("#" + fSel.sI[i]).addClass("cursorMove");
					
					//change look of selected class
					if(fSession[jO.tr(fSel.sI[i])].editAs == 1) {
						$("#" + fSel.sI[i]).addClass("selectedInst");	
					}
				}
				else if (fSel.sI[i].match("t")) {
					$("#" + fSel.sI[i]).addClass("selectedTxt");
					$("#" + fSel.sI[i]).addClass("cursorMove");
				}
				else if (fSel.sI[i].match("f")) {
					$("#" + fSel.sI[i]).addClass("selected");
					$("#" + fSel.sI[i]).addClass("cursorMove");
				}
			}
			//style the parent
			$("#" + fSel.sI[0]).parent().addClass("parent");
		}
	},
	positionManager : function(what) {
		var setx = 0;
		var sety = 0;

		$('#' + what).fadeIn(100);
		//check if x is not exceeding maximum x allowed
		if(fGM.x + $("#" + what).width() > $().width() - 40) {	setx = $().width() - 40 - $("#" + what).width();	}
		else { setx = fGM.x; }
		//check if y is not exceeding maximum y allowed
		if(fGM.y + $("#" + what).height() > $().height() - 60) {	sety = $().height() - 60 - $("#" + what).height();	}
		else { sety = fGM.y; }
		//check if x is not exceeding minimum x allowed
		if (fGM.x < 180) { setx = 180; }
		//check if y is not exceeding minimum y allowed
		if (fGM.y < 90) { sety = 90; }
		
		return[setx,sety];
	},
	saveLabel : function(event) {
		if (fWorkspace.allowSaveLabel == true) {
			//if the user clicks on the input box, do not run the rest of the code (to allow clicking on the input box / selecting text)
			if (!((event.type == "click") && ($(event.target).attr("id") == "fEditing"))) {
				//alert($(event.target).attr("id") + event.type);
				
				//stop saveLabel from running twice (since multiple events are bound which call this function)
				fWorkspace.allowSaveLabel = false;
				
				//update jData
				//alert(fWorkspace.editingLabelInstance);
				saveAs = $("#" + fWorkspace.editingLabelInstance).find("input").attr("value");
				if ((saveAs == "") || saveAs == undefined) {
					saveAs = "New Object";
				}
				jO.jData.objects[jO.jData.instances[fWorkspace.editingLabelInstance].of].name = saveAs;
				
				hotkeysEnable();
				
				$("#" + fWorkspace.editingLabelInstance).unbind("change blur", fWorkspace.saveLabel);
				//$(window).unbind("click", fWorkspace.saveLabel);
				$("#container").unbind("click", fWorkspace.saveLabel);
				
				//redraw
				fWorkspace.redraw({
					type: 'object',
					item: jO.jData.instances[fWorkspace.editingLabelInstance].of
				});
				
				//enable last drag
				fSel.makeDraggable(lastDraggable);
				
				//update footer
				fFooter.redrawFooter();
			}
		}
	},
	saveText : function(event) {
		//if the user clicks on the text box, do not run the rest of the code (to allow clicking on the input box / selecting text)
		if (!((event.type == "click") && ($(event.target).attr("id") == "fEditing"))) {
		
			//update jData
			saveAs = $("#fEditing").val();
			jO.jData.elements[jO.tr(fWorkspace.editingTextInstance)].txt = saveAs;
			
			hotkeysEnable();
			
			$("#container").unbind("click", fWorkspace.saveText);
			
			parentInstance = $("#" + fWorkspace.editingTextInstance).parent().attr("id");
			fWorkspace.redraw({
				type: 'page'
			});
			
			fWorkspace.editingText = false;
			
			//enable last drag
			fSel.makeDraggable(lastDraggable);
			
			//update footer
			fFooter.redrawFooter();
			
			//bring back focus to window
			$(window).focus();
		}
	}
}


// -------- fSel Object -----
// all selected items (objects, instances), states. DOM references
var fSel = {
	//editing as
	editAs : 0, //editing selected item as 0 Object, or 1 Instance
	editStatesAs : 0, //editing selected item states as 0 individual state, or 1 as All states 
	
	sI : new Array(), //selected instances (strings)
	jObj : "", //reference to first selected JSON object (without state)
	jInst : "", //reference to first selected JSON instance (without state)
	nObj : "", //string name of selected object
	nInst : "", //string name of selected instance
	lastText : null, //string name of last drawn or selected text
	
	selectBinding : function(event) {
		var element=$(event.target);
		var whatClicked = event.which;
	
		//clear resizable?
		killResizable();
		
		//if clicked on label, grab the parent element
		if(element.attr("class") == "fLabel") {element = element.parent().parent();}
		
		//make the new element draggable (if its not the workspace and it is not already selected (the same object))
		if ((element.attr("id") != "fWorkspace") && (lastDraggable != element)) {
	
			//only continue if not a right click (which is reserved for a different handler)
			if(event.button != 2) {
				//only allow to select fObjects or fText or fForm
				if((element.attr("class").match("fObject")) || (element.attr("class").match("fText")) || (element.attr("class").match("fForm"))) {
					fSel.selectObject(element); //change its class and update selectedObject
				}
			};
		}
		if (element.attr("id") == "fWorkspace") {
			// select the fWorkspace
			fSel.selectObject(element);
			//if (fSel.sI.length > 0) {	fSel.sI.splice(0); }
			
			// kill draggables
			killDrag();
		}
	},
	selectObject : function(what) {
		// can access an index number to a DOM element, a DOM reference or an instance name
		// what is converted to a jQuery object
		//alert(what + ":" + $(what).attr("id"));
		if (typeof what == "number") {
			what = $("div").get(what);
			what = $(what);
		}
		else if (typeof what == "string") {
			instLoop = what;
			//check if the instance is on the page, otherwise get the proper page and switch to it
			if ( $("#" + what).length == 0 ) {
				var foundPage = null;
				
				while (foundPage == null)
				{
					// do the check to find the page number
					if(jO.jData.instances[instLoop].p.match("page")) {
						foundPage = jO.jData.instances[instLoop].p;
					}
					else {
						//set proper states of the parent
						fSession[jO.jData.instances[instLoop].p].state = jO.jData.instances[instLoop].ps;
						
						//loop through the next instance (parent)
						instLoop = jO.jData.instances[instLoop].p;
					}
				}
				
				//switchtopage
				fPanelPages.setSelectedPage(foundPage);
			}

			//convert to jQuery
			what = $("#" + what);	
		}
		
		
		//destroy last draggable
		killDrag();
		killResizable();
		
		//destroy last text
		this.lastText = null;
	
		//clear styles
		fWorkspace.clearStyles();
	
		// IF NO SHIFT IS HELD DOWN empty the whole array
		if (shiftPressed == false) {
			if (fSel.sI.length > 0) {	fSel.sI.splice(0,fSel.sI.length); }
		}
	
		//CONTINUE ADDING TO THE ARRAY
		// if the item is already selected, unselect it, otherwise add it
		itemExists = false;
		for (var i = 0; i < fSel.sI.length; i++) {
			if ((fSel.sI[i] == what.attr("id")) && (fSel.sI.length > 1)) {
				fSel.sI.splice(i,1); //remove the item from the selected list
				i--; // update loop index since an array item was removed
				itemExists = true;
				break;
			}
		}
		// Add the newly selected item
		if (itemExists == false) {
			fSel.sI.push(what.attr("id"));
		}
	
		// Begin Removal Part 1: remove: children of selected objects, and duplicates
		uniqueIds = {};
		childIds = {};
		for (var i = 0; i < fSel.sI.length; i++) {
			// children Ids collection
			// make a full list of children Ids to be deleted in case of a match
			childrenrarray = $("#" + fSel.sI[i]).find("div"); // matches any children of a selected element except using the workspace
			for (var j=0, len=childrenrarray.length; j<len; j++ ){
				childIds[$(childrenrarray[j]).attr("id")] = true;
			}
	
			// unique Ids collection + store how many instances there are of each duplicates
			if (uniqueIds[fSel.sI[i]] == undefined) {
				uniqueIds[fSel.sI[i]] = 1;
			}
			else {
				uniqueIds[fSel.sI[i]]++;
			}
		}
	
	
		// go over the list again and actually remove the children and duplicates
		for (var i = 0; i < fSel.sI.length; i++) {
			//remove the fSel.sI that are kids of fSel.sI
			if (childIds[fSel.sI[i]] == true) {
				fSel.sI.splice(i,1); //remove workspace
				i--; // update loop index since an array item was removed
				continue;
			}
			//remove the duplicates if more than 1
			if (uniqueIds[fSel.sI[i]] > 1) {
				uniqueIds[fSel.sI[i]]--;
				fSel.sI.splice(i,1); //remove workspace
				i--; // update loop index since an array item was removed
				continue;
			}
		}
	
		
		//WORKSPACE selected
		if (fSel.sI[0] == "fWorkspace") {
			//enable Footer
			$("#fObjInstHolder").hide();
			$("#fNoneSelectedHolder").show();
			$("#fFooterText").hide();
		}
		//TEXT elements
		else if (fSel.sI[0].match("t")) {
			//enable Footer
			$("#fObjInstHolder").hide();
			$("#fNoneSelectedHolder").hide();
			$("#fFooterText").show();
			//record lastText
			this.lastText = fSel.sI[0];
		}
		//FORM elements
		else if (fSel.sI[0].match("f")) {
			//enable Footer
			$("#fObjInstHolder").hide();
			$("#fNoneSelectedHolder").hide();
			$("#fFooterText").show();
		}
		//REAL OBJECTS / INSTANCES selected
		else 
			if (fSel.sI[0].match("ins")) {
				//update selected variables used by other functions
				fSel.jObj = jO.jData.objects[jO.jData.instances[jO.tr(fSel.sI[0])].of];
				fSel.jInst = jO.jData.instances[jO.tr(fSel.sI[0])];
				fSel.nObj = jO.jData.instances[jO.tr(fSel.sI[0])].of
				fSel.nInst = jO.tr(fSel.sI[0]);
				
				//enable footer
				$("#fNoneSelectedHolder").hide();
				$("#fObjInstHolder").show();
				$("#fFooterText").hide();
				
				//update instance
				$("#fInstName").html("Instance 1 of 2"); //todo make this display "Instance 1 of 8".
				//update object
				$("#fObjName").html(fSel.jObj.name);
				
				//set editAs MODE
				//if instance  already has editAs chosen, do not change the mode, so that a double click is possible
				if (fSession[fSel.nInst].editAs != null) {
					if (fSession[fSel.nInst].editAs == 0) {
						fFooter.editObject();
					}
					else {
						fFooter.editInstance();
					}
				}
				// if instance is not inheriting any of the pos / size properties, edit as instance
				else 
					if ((fSel.jInst.states[fSession[fSel.nInst].state].iPos == 0) || (fSel.jInst.states[fSession[fSel.nInst].state].iSize == 0)) {
						//update fSession
						fSession[fSel.nInst].editAs = 1;
						//set toggle
						fFooter.editInstance();
					}
					else {
						//update fSession
						fSession[fSel.nInst].editAs = 0;
						//set toggle
						fFooter.editObject();
					}
				
				//set editStatesAs MODE
				if (fSession[fSel.nInst].editStatesAs == 0) {
					fStateManager.editOneState();
				}
				else {
					fStateManager.editAllStates();
				}
				
				//set AllInstances 
				fFooter.instRedraw();
				
		}
		//restyle workspace items
		fWorkspace.restyle();
		
		//make draggable and resizable
		if (fSel.sI[0] != "fWorkspace") {
			//alert($(what).attr("id"));
			this.makeDraggable($(what).attr("id"));
			
			if (!fSel.sI[0].match("f")) {
				this.makeResizable($(what).attr("id"));
			}
		}
		
	},
	makeDraggable : function(what) {
		// create new draggable & store it
		lastDraggable = what; //remember the new draggable object
		mydrag = what;
		$("#"+mydrag).draggable({cancel: [''], distance: 5, containment: "#fWorkspace", handle: what, start: dragRegister, drag: dragItems, stop: dragStop});
	},
	makeResizable : function(event){
	//can take an event or an instance name
	if(typeof event == "object") {
		var element=$(event.target).attr("id");
		event.stopPropagation();
		
		//only resize fObject (as a result of nested events, items within fObject also call the resize function)
		if(($(event.target).hasClass("fObject") == false) && ($(event.target).hasClass("fText") == false)) {return false;}
	}
	else {
		var element=event;
	}

	//make resizable
	myresize = element;
	$("#" + myresize).resizable({ transparent: true, handles: 'all', minHeight: 1, minWidth: 1, resize: updateInfoWH, stop: resizeStop });
	},
	highlight : function() {
		if (fSel.sI[0] != null) {
			if ((fSel.sI[0].match("ins")) || (fSel.sI[0].match("fWorkspace"))) {
				highLightWhat = fSel.sI[0];
			}
			else {
				//grab parent
				highLightWhat = $("#" + fSel.sI[0]).parent().attr("id");
			}
			//determine what color to show depending on editmode (if instance)
			highlightClass = "";
			highlightA = "";
			if ((highLightWhat.match("ins"))) {
				if(fSession[jO.tr(highLightWhat)].editAs == 0) {
					highlightClass = " fHmaster";
					highlightA = "M";
				}
				else if(fSession[jO.tr(highLightWhat)].editAs == 1) {
					highlightClass = " fHinstance";
					highlightA = "I";
				}
			}
			
			//animate border to indicate where you are drawing (for instances)
			$("#" + highLightWhat).prepend('<div class="fHighlight' + highlightClass + '"></div>');
			//determine if to put the arrow on the left or on the right of the selected box
			//alert($("#" + fSel.sI[0]).offset().left);
			if($("#" + highLightWhat).offset().left < 175) {
				$("#" + highLightWhat).prepend('<div class="fHighlightArrow fHARight"><img src="engine/images/drawingInside' + highlightA + 'Right.png"></div>');					
			}
			else {
				$("#" + highLightWhat).prepend('<div class="fHighlightArrow"><img src="engine/images/drawingInside' + highlightA + 'Left.png"></div>');	
			}
			$("#" + highLightWhat + " .fHighlight").width($("#" + highLightWhat).width());
			$("#" + highLightWhat + " .fHighlight").height($("#" + highLightWhat).height());
			$("#" + highLightWhat + " .fHighlight").animate({opacity: "1"}, 200).animate({opacity: "0",outlineOffset: "10"}, 1000, function(){$(this).remove();});
			$("#" + highLightWhat + " .fHighlightArrow").animate({opacity: "1"}, 1000).animate({opacity: "0"}, 3000, function(){$(this).remove();});
		}
	}
}


// -------- States -----
// this object manages everything related to states
var fStates = {
	loadFooterStates : function() {
		//load states for first selectedObject
	},
	fSCheckToggle : function(what) {
		//change look
		$("#"+what).toggleClass("fSOff");
		
		var state = fSel.jInst.states[fSession[fSel.nInst].state];	
		//update jO's instance properties by toggling them
		if(what == "fSPos") { state.iPos ^= 1 }
		if(what == "fSSize") { state.iSize ^= 1 }
		if(what == "fSContents") { state.iContents ^= 1 }
		if(what == "fSEvents") { state.iEvents ^= 1 }
		if(what == "fSPriority") { state.iPriority ^= 1 }
		
		//redraw	
		fWorkspace.redraw({type : 'instance', item : fSel.nInst});
	},
	fSCheckSetDisplay: function(what, checkedState){
		//check if a checkedState direction is being sent
		if(checkedState == 1) {
			$("#"+what).removeClass("fSOff");
		}
		else if(checkedState == 0) {
			$("#"+what).addClass("fSOff");
		}
	}
}



// -------- ToggleEdit Object -----
// this object controls how an instance is being edited
var fFooter = {
	editObject : function () {
		fSel.editAs = 0;
		fSession[fSel.nInst].editAs = 0;
		
		this.redrawFooter();
		
		//update "as" field
		$("#fEditMode").html("master");
		
		//change look of selected class
		$("#" + fSel.sI[0]).removeClass("selectedInst");
		
		//clear button Instance
		var imgsrc = $("#buttonInstance").attr("src");
		imgsrc = imgsrc.replace("_on","_off");
		$("#buttonInstance").attr("src",imgsrc);
		
		//set OneState
		imgsrc = $("#buttonMaster").attr("src");
		imgsrc = imgsrc.replace(/(_over|_off)/,"_on");
		$("#buttonMaster").attr("src",imgsrc);
		
	},	
	editInstance : function () {
		fSel.editAs = 1;
		fSession[fSel.nInst].editAs = 1;
		
		//show Checkboxes & allow for pointing cursor
		$(".fSCheck").show();
		$(".fSTitle").css("cursor","pointer");
			
		this.redrawFooter();	
		
		//update "as" field
		$("#fEditMode").html("instance");
		
		//change look of selected class
		$("#" + fSel.sI[0]).addClass("selectedInst");
		
		//clear button Instance
		var imgsrc = $("#buttonMaster").attr("src");
		imgsrc = imgsrc.replace("_on","_off");
		$("#buttonMaster").attr("src",imgsrc);
		
		//set OneState
		imgsrc = $("#buttonInstance").attr("src");
		imgsrc = imgsrc.replace(/(_over|_off)/,"_on");
		$("#buttonInstance").attr("src",imgsrc);
	},
	redrawFooter : function () {
		if (fSel.sI[0].match("ins")) {
			//update object name
			$("#fObjName").html(fSel.jObj.name);
			
			//update statename
			$("#fStateName").text(fSel.jObj.states[fSession[fSel.nInst].state].sName);
			
			//update inheritance properties
			if (fSel.jInst.states[fSession[fSel.nInst].state].iSize == 0) {
				fStates.fSCheckSetDisplay('fSSize', false);
			}
			else {
				fStates.fSCheckSetDisplay('fSSize', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iPos == 0) {
				fStates.fSCheckSetDisplay('fSPos', false);
			}
			else {
				fStates.fSCheckSetDisplay('fSPos', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iContents == 0) {
				fStates.fSCheckSetDisplay('fSContents', false);
			}
			else {
				fStates.fSCheckSetDisplay('fSContents', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iEvents == 0) {
				fStates.fSCheckSetDisplay('fSEvents', false);
			}
			else {
				fStates.fSCheckSetDisplay('fSEvents', true);
			}
			if (fSel.jInst.states[fSession[fSel.nInst].state].iPriority == 0) {
				fStates.fSCheckSetDisplay('fSPriority', false);
			}
			else {
				fStates.fSCheckSetDisplay('fSPriority', true);
			}
			
			//update setwidth & setheight boxes
			updateInfoWH();
			updateInfoXYPos();
		}
		else if (fSel.sI[0].match("t")) {
		}
	},
	instRedraw : function () {
		//clear
		$("#fFInstItems").children().remove();
		
		//populate
		for (items in fSel.jObj.allInstances) {
			$("#fFInstItems").append('<a href="#" onclick="fSession.' + items + '.changed = 0; fSel.selectObject(\'' + items +  '\');" title="' + items + '"><img src="engine/images/buttonInst_off.png" id="fFInst_' + items + '"></a>');
			
			//set changed view
			if(fSession[items].changed == 1) {
				$("#fFInst_" + items).css("opacity","1");
			}
		}
		
		//set selected
		imgsrc = $("#fFInst_" + fSel.nInst).attr("src");
		newimgsrc = imgsrc.replace("_off","_on");
		$("#fFInst_" + fSel.nInst).attr("src",newimgsrc);
		$("#fFInst_" + fSel.nInst).css("opacity","1");
		fSession[fSel.nInst].changed = 0;
	}
}




var fPanelPages = {
	itemCount : 0,
	rememberPageSelectedId : null,
	panelId : "fPanelPages",
	attachTo : "#fPanelPages",
	draw : function () {
		var thisref = this; //I need this private reference for the bindings events
		
		//remove existing page divs
		$(this.attachTo + " *.panelItem").each(function() {$(this).remove();});
		
		//create content divs
		$.each(jO.jData.pages, function(i,item){
			// page div
			$(thisref.attachTo + " div.fPanelItemsList").append('<div class="panelItem" id="' + i + '">' + item.pageName + '</div>');
			//attach double click for rename
			$(thisref.attachTo + " div.fPanelItemsList").children(':last').bind("dblclick", function() {$(this).fEditable();});
		
		
			////PANELPAGES CODE - custom
			if (thisref.panelId == "fPanelPages") {
				//attach single click for select 
				$(thisref.attachTo + " div.fPanelItemsList").children(':last').bind("click", function() {thisref.setSelectedPage(i); });
				//loadnew items TODO
			}	
		});
		
		//attach extend event
		$(this.attachTo).hover(function() {	 $("#fPanelPages").animate({"width" : thisref.cssPanelWidthExp}, {queue : false, duration: 150, easing: "swing"})}, function() {$(this).animate({"width" : thisref.cssPanelWidthCon}, {queue : false, duration: 150, easing: "swing"}); });
		
		//attach bg icon in title
		//grab the existing blank - workaround for not being able to set the background-image property relatively
		blankBg = $(this.attachTo + " div.panelTitle").css("background-image");
		//replace blank.gif with real image
		imgpath = blankBg.replace("blank.gif","bg_icon_" + this.panelId + ".gif");
		//attach bg with good path
		$(this.attachTo + " div.panelTitle").css("background-image",imgpath);
		$(this.attachTo + " div.panelTitle").css("background-repeat","no-repeat");
		$(this.attachTo + " div.panelTitle").css("background-position","0px 1px");
		
		//increase pagecount
		this.itemCount = jO.countObjProperties();
		
		//draw the up down controllers
		//show
		$(this.attachTo + " *.panelArrowDown," + this.attachTo + " *.panelArrowUp").css("display","block");
		//attach hovers
		$(this.attachTo + " *.panelArrowDown").hover(function() {$(this).addClass("panelArrowDownHover")}, function() {$(this).removeClass("panelArrowDownHover")});
		$(this.attachTo + " *.panelArrowUp").hover(function() {$(this).addClass("panelArrowUpHover")}, function() {$(this).removeClass("panelArrowUpHover")});
		//collapse inner div to make space
		$(this.attachTo + " *.fPanelItemsList").addClass("fPanelItemsListCollapse");
		//mouse wheel scrolling
		$(this.attachTo).mousewheel(function(event, delta) {
		if (delta > 0) {
			$(thisref.attachTo + " *.fPanelItemsList").scrollTo('-=5px');
		}
		else if (delta < 0)
			$(thisref.attachTo + " *.fPanelItemsList").scrollTo('+=5px');
			return false; // prevent default
		}
		);
		//click scrolling
		$(this.attachTo + " *.panelArrowDown").click(function() {$(thisref.attachTo + " *.fPanelItemsList").scrollTo('+=14px')});
		$(this.attachTo + " *.panelArrowUp").click(function() {$(thisref.attachTo + " *.fPanelItemsList").scrollTo('-=14px')});

	
		this.setSelectedPage(this.selectedPageId);
	},

	arrows : function (what) {

	},

	add : function () {
		var thisref = this;
		pageId = jO.getAvailableId('page');
		jO.jData.pages[pageId] = new Object();
		jO.jData.pages[pageId].pageName = "New Page2";
		jO.jData.pages[pageId].contains = new Object;
		
		//trigger a click just in case elements are being edited. in order to run click bound save functions 
		$("#fPanelPages").click();
		
		//select the last page in line
		this.selectedPageId = pageId;
		this.draw();
		
		////PANELPAGES CODE - custom
		if (thisref.panelId == "fPanelPages") {
		//clear previous workspace
		fWorkspace.clear();	
		}
		
		// scroll to the last item
		$(this.attachTo + " *.fPanelItemsList").scrollTo($(this.attachTo + " *.fPanelItemsList").children(":last-child"));
		
	},

	remove : function () {
		//trigger a click just in case elements are being edited. in order to run click bound save functions 
		$("#fPanelPages").click();
		
		//if more than 1 page 
		//count
		var i = 0;
		for (pages in jO.jData.pages){ i++; }
		if (i > 1) {
			//replace with splice
			delete jO.jData.pages[this.selectedPageId];
			
			//select the last page in line
			this.selectedPageId = jO.getLastPageId();
			
			//replace draw with just dom updates? :) quicker
			this.draw();
			
			// scroll to the last item
			$(this.attachTo + " *.fPanelItemsList").scrollTo($(this.attachTo + " *.fPanelItemsList").children(":last-child"));
		}
	},

	setSelectedPage : function (selectWhat) {
		//alert(this.rememberPageSelectedId + ":" + selectWhat);
		//kill resizable
		killDrag();
		killResizable();
		
		//revert old
		$("#" + this.rememberPageSelectedId).removeClass("panelItemSelected")

		//change new
		$("#" + selectWhat).addClass("panelItemSelected")
		
		this.selectedPageId = selectWhat;

		this.rememberPageSelectedId = selectWhat;
		// reposition?
		
		//select workspace
		//fSel.selectObject($("fWorkspace"));
		
		//redraw workspace
		fWorkspace.redraw({type: 'page'});
		fWorkspace.restyle();
		
	}
};


