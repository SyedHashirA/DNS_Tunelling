import pandas as pd
from model_utils import train_all_models

if __name__ == '__main__':
    # Create sample dataset if it doesn't exist
    import os
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    sample_data_path = os.path.join(data_dir, 'dns_samples.csv')
    if not os.path.exists(sample_data_path):
        print("Creating sample dataset at", sample_data_path)
        sample_data = {
            'query': [
                'google.com', 'youtube.com', 'github.com', 'stackoverflow.com',
                'wikipedia.org', 'amazon.com', 'twitter.com', 'linkedin.com',
                'facebook.com', 'instagram.com', '4n4l1z3r.xyz', 'data-exfil.attacker.com',
                'c2-server.pwned.net', 'malware.xyz', 'dns-tunnel.proxy.com',
                'exfiltrate.xyz', 'hacker.space', 'evil.com', 'pwned.org'
            ],
            'label': [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1]
        }
        df = pd.DataFrame(sample_data)
        df.to_csv(sample_data_path, index=False)
    
    print("Starting training on sample data...")
    result = train_all_models(sample_data_path)
    print("Training complete!")
    print(result)