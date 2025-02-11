import { createSignal, createEffect, For } from "solid-js";

export default function Home() {
	// const [toplays, setToplays] = createSignal([
	// 	{ id: 1, title: "Do laundry", completed: false },
	// 	{ id: 2, title: "Clean room", completed: false },
	// 	{ id: 3, title: "Go to the gym", completed: false },
	// ]);

	// Set a variable to store the default todos
	const defaultToplays = [
		{ id: 1, title: "Do laundry", completed: true },
		{ id: 2, title: "Clean room", completed: false },
		{ id: 3, title: "Go to the gym", completed: false },
	];

	// Initialize toplays from local storage if exists, otherwise initilize toplays with the default list
	const [toplays, setToplays] = createSignal(
		localStorage.getItem("toplays")
			? JSON.parse(localStorage.getItem("toplays"))
			: defaultToplays
	);

	// Save toplays to local storage on every update
	createEffect(() => {
		localStorage.setItem("toplays", JSON.stringify(toplays()));
	});

	const [searchQuery, setSearchQuery] = createSignal("");
	const [searchResults, setSearchResults] = createSignal([]);
	const [loading, setLoading] = createSignal(false);

	const searchBoardGames = async () => {
		if (!searchQuery().trim()) {
			setSearchResults([]);
			return;
		}
		setLoading(true);
		try {
			const response = await fetch(
				`https://boardgamegeek.com/xmlapi2/search?type=boardgame&query=${encodeURIComponent(
					searchQuery()
				)}`
			);
			const text = await response.text();
			const parser = new DOMParser();
			const xml = parser.parseFromString(text, "text/xml");
			const items = xml.querySelectorAll("item");

			const results = Array.from(items)
				.slice(0, 4)
				.map((item) => ({
					id: item.getAttribute("id"),
					name: item.querySelector("name")?.getAttribute("value") || "Unknown",
					year:
						item.querySelector("yearpublished")?.getAttribute("value") || "N/A",
				}));

			setSearchResults(results);
		} catch (error) {
			console.error("Error fetching board games:", error);
			setSearchResults([]);
		}
		setLoading(false);
	};

	const addToplay = (game) => {
		setToplays([
			...toplays(),
			{ id: game.id, title: `${game.name} (${game.year})`, completed: false },
		]);
		setSearchQuery("");
		setSearchResults([]);
	};

	// Create a function to add a new toplay
	// const addToplay = (e) => {
	// 	e.preventDefault();
	// 	console.log(e);
	// 	setToplays([
	// 		...toplays(),
	// 		{
	// 			id: toplays().length ? toplays()[toplays().length - 1].id + 1 : 1,
	// 			title: e.target.toplay.value,
	// 			completed: false,
	// 		},
	// 	]);
	// 	e.target.toplay.value = "";
	// };

	const setCompleted = (id) => {
		setToplays((toplays) =>
			toplays.map((toplay) =>
				toplay.id === id ? { ...toplay, completed: !toplay.completed } : toplay
			)
		);
	};
	// Set a toplay as completed
	// const setCompleted = (id) => {
	// 	setToplays((toplays) =>
	// 		toplays.map((toplay) =>
	// 			toplay.id === id ? { ...toplay, completed: !toplay.completed } : toplay
	// 		)
	// 	);
	// };

	// Delete a todo
	const deleteToplay = (id) => {
		setToplays((toplays) => toplays.filter((toplay) => toplay.id !== id));
	};

	return (
		<main class="py-40 flex flex-col items-center">
			<h1 class="text-5xl font-bold text-gray-900 text-center">ToPlay List</h1>

			<div class="search-container">
				<input
					type="text"
					placeholder="Search for a board game..."
					value={searchQuery()}
					onInput={(e) => {
						setSearchQuery(e.target.value);
						searchBoardGames();
					}}
					class="input-field"
				/>

				{loading() && <p>Loading...</p>}
				{searchResults().length > 0 && (
					<ul class="search-results">
						<For each={searchResults()}>
							{(game) => (
								<li onClick={() => addToplay(game)} class="search-result">
									{game.name} ({game.year})
								</li>
							)}
						</For>
					</ul>
				)}
			</div>
			<div className="toplay-list">
				<For each={toplays()}>
					{(toplay) => (
						<div
							class={`toplay-item${
								toplay.completed ? " completed" : " pending"
							}`}
						>
							<div class="content">
								<input
									type="checkbox"
									checked={toplay.completed}
									onChange={() => setCompleted(toplay.id)}
								/>
								<h3 class="card-title">{toplay.title}</h3>
							</div>
							<button
								class="btn btn-error"
								onClick={() => deleteToplay(toplay.id)}
							>
								X
							</button>
						</div>
					)}
				</For>
			</div>
		</main>
		// <main class="py-40">
		// 	<h1 class="text-5xl font-bold text-gray-900 text-center">ToPlay List</h1>

		// 	<div class="container">
		// 		<For each={toplays()}>
		// 			{(toplay) => (
		// 				<div class={`toplay${toplay.completed ? " completed" : ""}`}>
		// 					<div class="content">
		// 						<input
		// 							type="checkbox"
		// 							checked={toplay.completed}
		// 							onChange={() => setCompleted(toplay.id)}
		// 						/>
		// 						<h3 class="card-title">{toplay.title}</h3>
		// 					</div>
		// 					<button
		// 						class="btn btn-error"
		// 						onClick={() => deleteToplay(toplay.id)}
		// 					>
		// 						X
		// 					</button>
		// 				</div>
		// 			)}
		// 		</For>
		// 		{/* Create a form that adds a new toplay on submission */}
		// 		<form onSubmit={addToplay}>
		// 			<input
		// 				type="text"
		// 				name="toplay"
		// 				placeholder="New Board Game"
		// 				required
		// 			/>
		// 			<button type="submit">+ Add Board Game</button>
		// 		</form>
		// 	</div>
		// </main>
	);
}
