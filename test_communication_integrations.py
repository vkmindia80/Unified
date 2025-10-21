#!/usr/bin/env python3
"""
Test script for Communication System Integrations

This script demonstrates how to interact with the communication system integrations
through the API endpoints.

Usage:
    python test_communication_integrations.py

Note: You'll need admin credentials to access these endpoints.
"""

import requests
import json
from getpass import getpass

# Configuration
BASE_URL = "http://localhost:8001/api"

def login(email, password):
    """Login and get JWT token"""
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    
    if response.status_code == 200:
        data = response.json()
        return data["access_token"]
    else:
        print(f"Login failed: {response.status_code}")
        print(response.json())
        return None

def get_integrations(token):
    """Get all configured integrations"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/admin/integrations", headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch integrations: {response.status_code}")
        return []

def test_connection(token, integration_name):
    """Test connection to an integration"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/integrations/{integration_name}/test-connection",
        headers=headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Test failed: {response.status_code}")
        return {"success": False, "message": "Request failed"}

def send_message(token, integration_name, message, title=None, channel=None, phone_numbers=None):
    """Send a message through an integration"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {"message": message}
    if title:
        payload["title"] = title
    if channel:
        payload["channel"] = channel
    if phone_numbers:
        payload["phone_numbers"] = phone_numbers
    
    response = requests.post(
        f"{BASE_URL}/integrations/{integration_name}/send-message",
        headers=headers,
        json=payload
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Send failed: {response.status_code}")
        return {"success": False, "message": "Request failed"}

def main():
    print("=" * 60)
    print("Communication Systems Integration Test")
    print("=" * 60)
    print()
    
    # Login
    print("Please login with admin credentials:")
    email = input("Email: ")
    password = getpass("Password: ")
    
    print("\nAuthenticating...")
    token = login(email, password)
    
    if not token:
        print("Authentication failed. Exiting.")
        return
    
    print("✓ Authentication successful!\n")
    
    # Get integrations
    print("Fetching integrations...")
    integrations = get_integrations(token)
    
    # Filter communication systems
    comm_systems = [i for i in integrations if i.get("type") == "communication"]
    
    print(f"\n✓ Found {len(comm_systems)} communication systems:\n")
    
    for idx, system in enumerate(comm_systems, 1):
        status = "✓ Enabled" if system.get("enabled") else "✗ Disabled"
        print(f"  {idx}. {system['display_name']} ({system['name']}) - {status}")
    
    print("\n" + "=" * 60)
    print("Integration Testing Menu")
    print("=" * 60)
    print()
    
    while True:
        print("\nOptions:")
        print("  1. Test connection to an integration")
        print("  2. Send a test message")
        print("  3. View integration details")
        print("  4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            print("\nAvailable integrations:")
            for idx, system in enumerate(comm_systems, 1):
                print(f"  {idx}. {system['display_name']}")
            
            try:
                idx = int(input("\nSelect integration (number): ")) - 1
                if 0 <= idx < len(comm_systems):
                    system = comm_systems[idx]
                    print(f"\nTesting connection to {system['display_name']}...")
                    result = test_connection(token, system['name'])
                    
                    if result.get("success"):
                        print(f"✓ {result.get('message')}")
                        if result.get("details"):
                            print(f"  Details: {json.dumps(result['details'], indent=2)}")
                    else:
                        print(f"✗ {result.get('message')}")
                else:
                    print("Invalid selection")
            except (ValueError, IndexError):
                print("Invalid input")
        
        elif choice == "2":
            print("\nAvailable integrations:")
            enabled = [s for s in comm_systems if s.get("enabled")]
            
            if not enabled:
                print("  No enabled integrations found. Please enable at least one integration first.")
                continue
            
            for idx, system in enumerate(enabled, 1):
                print(f"  {idx}. {system['display_name']}")
            
            try:
                idx = int(input("\nSelect integration (number): ")) - 1
                if 0 <= idx < len(enabled):
                    system = enabled[idx]
                    
                    print(f"\nSending message via {system['display_name']}:")
                    message = input("  Message: ")
                    title = input("  Title (optional): ").strip() or None
                    
                    # Additional fields based on integration type
                    channel = None
                    phone_numbers = None
                    
                    if system['name'] in ['slack', 'discord']:
                        channel = input("  Channel (optional): ").strip() or None
                    
                    if system['name'] == 'twilio':
                        phone_input = input("  Phone numbers (comma-separated, with country code): ").strip()
                        if phone_input:
                            phone_numbers = [p.strip() for p in phone_input.split(",")]
                    
                    print(f"\nSending message...")
                    result = send_message(token, system['name'], message, title, channel, phone_numbers)
                    
                    if result.get("success"):
                        print(f"✓ {result.get('message')}")
                    else:
                        print(f"✗ {result.get('message')}")
                else:
                    print("Invalid selection")
            except (ValueError, IndexError):
                print("Invalid input")
        
        elif choice == "3":
            print("\nAvailable integrations:")
            for idx, system in enumerate(comm_systems, 1):
                print(f"  {idx}. {system['display_name']}")
            
            try:
                idx = int(input("\nSelect integration (number): ")) - 1
                if 0 <= idx < len(comm_systems):
                    system = comm_systems[idx]
                    print(f"\n{system['display_name']} Details:")
                    print(f"  Name: {system['name']}")
                    print(f"  Type: {system['type']}")
                    print(f"  Description: {system['description']}")
                    print(f"  Enabled: {system.get('enabled')}")
                    print(f"  Fields: {len(system.get('fields', []))}")
                    
                    if system.get('updated_at'):
                        print(f"  Last Updated: {system['updated_at']}")
                else:
                    print("Invalid selection")
            except (ValueError, IndexError):
                print("Invalid input")
        
        elif choice == "4":
            print("\nExiting. Goodbye!")
            break
        
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted by user. Exiting.")
    except Exception as e:
        print(f"\nError: {str(e)}")
