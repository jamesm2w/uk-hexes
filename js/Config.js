class Config {
	constructor () {
		this._scaledWidthBar = "configScaleBarWidth";
		this._hexFill = "configHexFill";
		this._displayMode = "configDisplayMode";

		this.hexFills = ["default", "second", "majority", "turnout"];
		this.currentHexFill = 0;

		this.displayModes = ["default", "plurality", "majority"];
		this.currentDisplayMode = 0;

		document.getElementById(this._displayMode).addEventListener("change", e => {
			this.displayMode = e.target.value;
			window.map.refreshMap();
		});

		document.getElementById(this._hexFill).addEventListener("change", e => {
			this.hexFill = e.target.value;
			window.map.refreshMap();
		});
	}
	
	get scaledWidthBar () {
		return document.getElementById(this._scaledWidthBar).checked;
	}

	get displayChanger () {
		return 
	}

	get hexFill () {
		return this.hexFills[this.currentHexFill];
	}

	set hexFill (mode) { 
		if (typeof mode == "number") {
			this.currentHexFill = mode;
		} else {
			this.currentHexFill = this.hexFills.indexOf(mode);
		}
	}

	get displayMode () {
		return this.displayModes[this.currentDisplayMode];
	}

	set displayMode (mode) {
		if (typeof mode == "number") {
			this.currentDisplayMode = mode;
		} else {
			this.currentDisplayMode = this.displayModes.indexOf(mode);
		}
	}
}