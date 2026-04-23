def test_flashcard_generation_offline(auth_client):
    # Create a note first
    r = auth_client.post(
        "/notes",
        json={
            "title": "Photosynthesis",
            "content": (
                "Photosynthesis is the process by which plants convert sunlight into chemical energy. "
                "It occurs in the chloroplasts and produces glucose and oxygen. "
                "The light-dependent reactions capture energy from photons."
            ),
        },
    )
    assert r.status_code == 201
    note_id = r.json()["id"]

    # Generate cards (offline stub)
    r = auth_client.post(
        "/flashcards/generate",
        json={"note_id": note_id, "count": 3},
    )
    assert r.status_code == 201
    deck = r.json()
    assert deck["source_note_id"] == note_id
    assert len(deck["cards"]) >= 1

    # Review a card
    card_id = deck["cards"][0]["id"]
    r = auth_client.post(f"/flashcards/cards/{card_id}/review", json={"rating": "good"})
    assert r.status_code == 200
    assert r.json()["ease"] >= 1
