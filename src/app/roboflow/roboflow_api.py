from inference_sdk import InferenceHTTPClient

# Create a client to Roboflow
client = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="kOMqAVhkOoiAg4BbctHK"
)

# Run the workflow
result = client.run_workflow(
    workspace_name="smart-fridge-mvi88",                 # Your Roboflow workspace name
    workflow_id="detect-count-and-visualize-2",          # Your published workflow ID
    images={ "image": "test.jpg" },                      # Replace with your image file name
    use_cache=True
)

# Print result
print("Workflow result:")
print(result)
