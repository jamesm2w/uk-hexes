class Config {
	constructor () {
		this._scaledWidthBar = "configScaleBarWidth";
	}
	
	get scaledWidthBar () {
		return document.getElementById(this._scaledWidthBar).checked;
	}
}