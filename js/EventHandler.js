class EventHandler {
	
	static removeFocus(map) {
		let svg = d3.select("#map svg");
		svg
			.transition()
			.duration(750)
			.call(map.zoom.transform, d3.zoomIdentity);

		d3.select("#selected")
			.html("")
			.attr("stroke-width", "0");

		map.displayLocked = false;
		map.currentFocus = undefined;

		document.getElementById("clearFocus").classList.add("hidden");
	}
	
	static focusOn(map, id) {
		document.getElementById("clearFocus").classList.remove("hidden");
		let hex = map.UKHexMap.hexes[id];

		let centreX = map.width / 2;
		let centreY = map.height / 2;

		let svg = d3.select("#map svg");

		d3.select("#selected")
			.attr("points", hex.points)
			.attr("stroke", "#ffc107")
			.attr("stroke-width", "3")
			.attr("fill", "none")
			.html("");
			//.append("animate")
			//.attr("attributeName", "stroke-width")
			//.attr("values", "0;3;0")
			//.attr("dur", "4s")
			//.attr("repeatCount", "indefinite");

		d3.select("#selectWrap").attr(
			"transform",
			"translate(" + hex.x + ", " + hex.y + ")"
		);

		if (d3.event) {
			d3.event.stopPropagation();
		}
		svg
			.transition()
			.duration(750)
			.call(
				map.zoom.transform,
				d3.zoomIdentity
					.translate(centreX, centreY)
					.scale(2.5)
					.translate(-hex.x, -hex.y)
			);


		map.displayLocked = true;
		map.currentFocus = id;
		map.showSeatResult(id);
	}
	
	static mouseOverHex (map, id) {
		if (map.displayLocked) {
			return;
		}
		map.currentFocus = id;
		map.showSeatResult(id);
	}
}