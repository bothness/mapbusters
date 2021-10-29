import { csvParse, autoType } from 'd3-dsv';

export async function getData(url) {
  let response = await fetch(url);
  let string = await response.text();
	let data = await csvParse(string, autoType);
  return data;
}

export function getAdjacents(data) {
		let adj = {};
		data.forEach(d => {
			adj[d.key] = [];
			data.forEach(e => {
				let found = false;
				d.vertices.forEach(dv => {
					let dx = (d.x + dv.x).toFixed(3);
					let dy = (d.y + dv.y).toFixed(3);
					e.vertices.forEach(ev => {
						let ex = (e.x + ev.x).toFixed(3);
						let ey = (e.y + ev.y).toFixed(3);
						if (dx == ex && dy == ey && d.key != e.key) {
							found = true;
						}
					});
				});
				if (found) {
					adj[d.key].push(e.key);
				}
			});
		});
	return adj;
	}