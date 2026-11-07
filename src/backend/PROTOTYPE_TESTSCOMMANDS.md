# Case 1 assessment checks

Start the API using the [backend setup](README.md) and run the backend tests. To try an assessment interactively, choose **AI only** under Case 1 in the frontend.

The endpoint returns `fixed-rule-v2` for new assessments. Each explanation names the signals matched by the rules and includes example record IDs. The confidence field is a fixed heuristic score. An earlier saved assessment retains its original rule version.
