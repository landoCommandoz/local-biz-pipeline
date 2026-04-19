# Brix video intake

Drop Kling MP4s here named exactly: `{agent_id}.mp4`.
Valid ids: jax hank vega brix doss vault signalscout forge max echo iris rex nova pixel zenith atlas neo

Next Brix tick catalogs the file, moves it to `businesses/public/assets/videos/{id}.mp4`,
and updates the rent-roll note. Cockpit reads from the destination path.
