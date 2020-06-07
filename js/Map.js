class Map {
	constructor () {
		this.zoom = d3.zoom();
		
		this.config = new Config();
		
		this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
        this.width = 600 - this.margin.left - this.margin.right;
        this.height = 700 - this.margin.top - this.margin.bottom;
		
		this.displayLocked = false;
		this.currentFocus = undefined;
		this.currentMap = {"year": 2019, "type": "General Election"};
		
		this.seatData = {};
		this.partyData = {};
		this.UKHexMap = {};
		
		this.ElectionResults = {};
		this.ByElectionResults = {};
		
		this.ConstituencyList = {};
		
		this.loadJSON();
		
		d3.select("#setFocus").on("click", () => {
			return focusOn(document.getElementById("focus").value);
		});

		document.getElementById("clearFocus").addEventListener("click", () => {
			EventHandler.removeFocus(this);
		});

		document.getElementById("selectConst").addEventListener("click", (e) => {

			let id = this.ConstituencyList[document.getElementById("inputConst").value];
			
			if (typeof id == "undefined") {
				EventHandler.removeFocus(this);
			} else {
				EventHandler.focusOn(this, id);	
			}
		});
		
	}

	switchDataSource (year, type) {
		this.currentMap = {"year": year, "type": type};

		this.showElectionData(year);
		this.showSeatData(year);

		document.getElementById("electionTitle").innerText = `${year} ${type} Results`;
		document.getElementById("electoralResult").innerText = this.seatData[year].result;
	}
	
	generateConstituencyList () {
		Object.keys(this.UKHexMap.hexes).forEach(item => {
			let onsKey = document.createElement("option");
			onsKey.value = item;
			
			let name = document.createElement("option");
			name.value = this.UKHexMap.hexes[item].n;
			
			document.getElementById("constituencies")
				.appendChild(onsKey)
				.appendChild(name);
				
			this.ConstituencyList[this.UKHexMap.hexes[item].n] = item;
			this.ConstituencyList[item] = this.UKHexMap.hexes[item].n;
		});
	}
	
	loadJSON () {
		d3.json("data/UKPGE.json").then(data => {
			this.seatData = data;
		}).catch(Logger.warn);
		
		d3.json("data/parties.json").then(data => {
			this.partyData = data.parties;

			this.partyData.colour = name => {
				name = name.toLowerCase();

				for (let i = 0; i < this.partyData.length; i++) {
					let party = this.partyData[i];

					if (
						party.entry.toLowerCase() == name ||
						party.fullname.toLowerCase() == name ||
						party.abbr.toLowerCase() == name
					) {
						return party.colour.toUpperCase();
					}
				}

				return "#DDDDDD";
			};

			this.partyData.abbreviateName = name => {
				let nameLower = name.toLowerCase();

				for (let i = 0; i < this.partyData.length; i++) {
					let party = this.partyData[i];

					if (
						party.entry.toLowerCase() == nameLower ||
						party.fullname.toLowerCase() == nameLower
					) {
						return party.abbr;
					}
				}

				return name;
			};


        }).catch(Logger.warn);
		
		d3.json("data/uk.hexjson").then(data => {
		  this.UKHexMap = data;
		  this.generateConstituencyList();
		  this.createMap();
		}).catch(Logger.warn);
		
		d3.json("data/2015.json").then(data => {
			this.ElectionResults[2015] = data;
		}).catch(Logger.warn);
		
		d3.json("data/2017.json").then(data => {
			this.ElectionResults[2017] = data;
		}).catch(Logger.warn);
		
		d3.json("data/2019.json").then(data => {
			this.ElectionResults[2019] = data;
			this.switchDataSource(2019, "General Election");
			this.showSeatResult("E14000530");
		}).catch(Logger.warn);
		
		d3.json("data/2015-2017_ByElections.json").then(data => {
			this.ByElectionResults["2015-2017"] = data;
		}).catch(Logger.warn);
		
		d3.json("data/2017-2019_ByElections.json").then(data => {
			this.ByElectionResults["2017-2019"] = data;
		}).catch(Logger.warn);
		
		d3.json("data/2019-_ByElections.json").then(data => {
			this.ByElectionResults["2019-"] = data;
		}).catch(Logger.warn);
	}
	
	createMap () {
		document.getElementById("map").innerHTML = "";

		// Create the svg element
		let viewBox = d3
			.select("#map")
			.append("svg")
			.attr("viewBox", [0, 0, this.width, this.height]);
		
		// Create wrapping element which enables zoom on the map
		let zoomable = viewBox
			.append("g")
			.attr("id", "zoomable")
			.call(
				this.zoom
					.on("zoom", () => {
						zoomable.attr("transform", d3.event.transform);
					})
					.extent([[0, 0], [this.width, this.height]])
					.scaleExtent([1, 8])
			)
			.on("wheel.zoom", null)
			.on(".zoom", null);
		
		// Create wrapping element which adds the margins to the map
		let svg = zoomable
			.append("g")
			.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		// Render the hexes
		let hexes = d3.renderHexJSON(this.UKHexMap, this.width, this.height);

		// Bind the hexes to g elements of the svg and position them
		let hexmap = svg
			.selectAll("g")
			.data(hexes)
			.enter()
			.append("g")
			.attr("transform", hex => {
				return "translate(" + hex.x + "," + hex.y + ")";
			});

		// Draw the polygons (hexagon) around each hex's centre
		hexmap
			.append("polygon")
			.attr("points", function(hex) {
				return hex.points;
			})
			.attr("stroke", "#212121")
			.attr("stroke-width", "2")
			.attr("class", "hexMapPolygon")
			.attr("id", hex => hex.key);

		let selected = svg
			.append("g")
			.attr("id", "selectWrap")
			.append("polygon")
			.attr("id", "selected");
	}
	
	showElectionData (dataKey) {

		if (this.ElectionResults[dataKey]) {
			
			for (let resultKey in this.ElectionResults[dataKey]) {
				let result = this.ElectionResults[dataKey][resultKey];
				let hexElement = d3.select("#" + resultKey);
				let winningParty = result.mp.party;
				let fillColour = this.partyData.colour(winningParty.toLowerCase()) || "#616161";
				
				
				hexElement.attr("fill", fillColour);
				hexElement.on("click", () => {
					return (this.displayLocked && this.currentFocus == resultKey) ?
						EventHandler.removeFocus(this) : EventHandler.focusOn(this, resultKey);
				});
				hexElement.on("mouseover", () => {
					return EventHandler.mouseOverHex(this, resultKey);
				});
			}

			if (this.currentFocus) {
				this.showSeatResult(this.currentFocus);
			}
			
		} else if (this.ByElectionResults[dataKey]) {
			this.results = this.ByElectionResults[dataKey];

			if (this.currentFocus && typeof this.results[this.currentFocus] != "undefined") {
				this.showSeatResult(this.currentFocus);
			} else {
				EventHandler.removeFocus(this);
			}

			d3.selectAll(".hexMapPolygon")
				.attr("fill", hex => {
					
					if (this.results[hex.key]) {
						
						let winningParty = this.results[hex.key].mp.party;
						return this.partyData.colour(winningParty.toLowerCase()) || "#616161";
					} else {
						return "#616161";
					}
				})
				.on("click", (hex) => {
					
					if (this.results[hex.key]) {
						return (this.displayLocked && this.currentFocus == hex.key) ?
							EventHandler.removeFocus(this) : EventHandler.focusOn(this, hex.key);
					}
				})
				.on("mouseover", (hex) => {
					
					if (this.results[hex.key]) {
						return EventHandler.mouseOverHex(this, hex.key);
					}
				});
			
		} else {
			Logger.warn("Invalid dataKey passed");
		}
	}

	showSeatData (dataKey) {
		let data = this.seatData[dataKey];

		let htmlString = "";

		let keysSorted = Object.keys(data).sort((a, b) => {return data[b].votes - data[a].votes});
		keysSorted.shift();
		document.getElementById("resultTable").innerHTML = `<tr> <th>Party</th> <th>Seats</th> <th>Votes</th> </tr>`;

		for (let key of keysSorted) {

			let listElement = document.createElement("tr");
			listElement.classList.add("resultRow");
			listElement.innerHTML = `<th>${this.partyData.abbreviateName(key)}</th>
			 <td>${data[key].seats}</td> <td>${data[key].votes}</td>`;

			listElement.setAttribute("style", `color: ${this.partyData.colour(key)};`)

			document.getElementById("resultTable").appendChild(listElement);
		}
	}

	showSeatResult (id) {
		let result;

		if (this.ElectionResults[this.currentMap.year]) {
			result = this.ElectionResults[this.currentMap.year][id];
			document.getElementById("byElectionInformation").innerHTML = "";
		} else if (this.ByElectionResults[this.currentMap.year]) {
			result = this.ByElectionResults[this.currentMap.year][id];
			document.getElementById("byElectionInformation").innerHTML = `<strong>Date: </strong>${result["by-election"].date} 
			<strong>Reason: </strong>${result["by-election"].reason}`;
		} else {
			return;
		}

		document.getElementById("constTitle").innerHTML = `${result.name} <span class="smallText">(${result.id})</span>`;
		document.getElementById("electedMP").innerHTML = `<strong>Elected MP: </strong>${result.mp.name}
		 (<span style="font-weight: 700; color: ${this.partyData.colour(result.mp.party)}">${result.mp.party}</span>)`;

		document.getElementById("resultInformation").innerHTML = `<strong>Result: </strong>${result.result}
		 <strong>Majority of</strong> ${result.majority}`;

		document.getElementById("electionInformation").innerHTML = `<strong>Electorate: </strong>${result.electorate} 
		<strong>Turnout: </strong>${result.turnout} (${(Math.floor((result.turnout / result.electorate) * 10000) / 100)}%)`;

		let table = document.getElementById("constResultTable");

		table.innerHTML = `<tr> <th class="party">Party</th> <th class="votes">Votes</th> <th class="progwrap">Bar</th> </tr>`;

		let otherTotal = 0;
		let otherParties = [];
		let otherChange = 0;

		let widthConstant =  1000 / Math.ceil( 1000 * result.candidates[0].votes / result.turnout );

		for (let candidateCount = 0; candidateCount < result.candidates.length; candidateCount++) {
			let candidate = result.candidates[candidateCount];

			let nameStr = (candidate.party == "Ind") ? candidate.candidate + " (Ind)" : candidate.party;
				nameStr += candidate.incumbent ? " (Inc)" : "";
				nameStr += candidate.elected ? " (*)" : "";

			if (candidateCount < 4 || candidate.incumbent) {

				let percent = Math.floor((candidate.votes / result.turnout) * 1000) / 10;
				let barPercent = percent;
				if (this.config.scaledWidthBar) {
					barPercent = percent * widthConstant;
				}

				let changeStr = candidate.change > 0 ? `+${candidate.change}` : `${candidate.change}`;

				let listElement = document.createElement("tr");
					listElement.classList.add("resultRow");
					listElement.innerHTML = `<th class="party">${nameStr}</th>
					<td class="votes">${candidate.votes} (${percent}%)</td>
					<td class="progwrap">
						<div style="width: ${barPercent}%; background-color: ${this.partyData.colour(candidate.party)}" class="progbar">
						</div>
						<div class="percentChange">(${changeStr})</div>
					</td>`;

				table.appendChild(listElement);
			} else {
				otherTotal += candidate.votes;
				otherParties.push(nameStr);
				otherChange += parseInt(candidate.change);
			}
		}

		if (otherTotal != 0) {
			let percent = Math.floor( (otherTotal / result.turnout) * 10000) / 100;
			let barPercent = percent;
			if (this.config.scaledWidthBar) {
				barPercent = percent * widthConstant;
			}

			let changeStr = otherChange > 0 ? `+${otherChange}` : `${otherChange}`;

			let listElement = document.createElement("tr");
				listElement.classList.add("resultRow");
				listElement.innerHTML = `<th class="party">Other</th>
				<td class="votes">${otherTotal} (${percent}%)</td>
				<td class="progwrap">
					<div style="width: ${barPercent}%; background-color: #DDDDDD" class="progbar">
					</div>
					<div class="percentChange">(${otherChange})</div>
				</td>`;
			document.getElementById("otherParties").innerHTML = `Others: ${otherParties.join(", ")}`;

			table.appendChild(listElement);
		} else {
			document.getElementById("otherParties").innerHTML = "";
		}

	}
}