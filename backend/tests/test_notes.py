def test_notes_crud(auth_client):
    # Empty to start
    r = auth_client.get("/notes")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

    # Create
    r = auth_client.post(
        "/notes",
        json={"title": "Calculus basics", "content": "Derivatives measure rate of change.", "subject": "Math"},
    )
    assert r.status_code == 201
    note = r.json()
    assert note["title"] == "Calculus basics"

    # Search
    r = auth_client.get("/notes", params={"q": "derivative"})
    assert r.status_code == 200
    assert len(r.json()) == 1

    # Update
    r = auth_client.put(f"/notes/{note['id']}", json={"title": "Calc 101"})
    assert r.status_code == 200
    assert r.json()["title"] == "Calc 101"

    # Summarize (offline fallback — just needs to return a string)
    r = auth_client.post(f"/notes/{note['id']}/summarize")
    assert r.status_code == 200
    assert "summary" in r.json()

    # Delete
    r = auth_client.delete(f"/notes/{note['id']}")
    assert r.status_code == 204
