class Config {
	constructor () {
		this._scaledWidthBar = "configScaleBarWidth";
		this._displayMode = "configHexFill";


		this.displayModes = ["default", "second"];
		this.currentDisplayMode = 0;

		document.getElementById(this._displayMode).addEventListener("change", e => {
			this.displayMode = e.target.value;
			window.map.refreshMap();
		});
	}
	
	get scaledWidthBar () {
		return document.getElementById(this._scaledWidthBar).checked;
	}

	get displayChanger () {
		return 
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