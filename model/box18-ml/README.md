# Box18 ML - SoccerNet Game State Setup

This directory contains the machine learning pipeline for Box18, a youth soccer analytics platform. It uses the SoccerNet Game State dataset and TrackLab framework for player tracking and game state reconstruction.

## Directory Structure

```
box18-ml/
├── data/               # SoccerNet dataset (excluded from git - large files)
├── sn-gamestate/       # SoccerNet game state tracking pipeline
└── tracklab/           # TrackLab framework (tracking library)
```

## Prerequisites

- **Python 3.9.x** (Required - does not work with 3.10+)
- **uv** package manager (installed via `curl -LsSf https://astral.sh/uv/install.sh | sh`)
- **macOS** (configured for CPU execution on Apple Silicon)
- **~20GB free disk space** (for datasets and pretrained models)

## Setup Instructions

### 1. Clone the Repositories

```bash
# Create the directory structure
mkdir -p box18-ml
cd box18-ml

# Clone sn-gamestate
git clone https://github.com/SoccerNet/sn-gamestate.git
cd sn-gamestate

# Clone tracklab (as a sibling directory)
cd ..
git clone https://github.com/TrackingLaboratory/tracklab.git
```

### 2. Install Python 3.9

If you don't have Python 3.9, install it via Homebrew:

```bash
brew install python@3.9
```

### 3. Set Up Virtual Environment and Dependencies

```bash
cd sn-gamestate

# Create virtual environment with Python 3.9
/opt/homebrew/bin/python3.9 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install uv package manager (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
~/.local/bin/uv pip install -e .

# Install mmcv (computer vision library)
~/.local/bin/uv pip install mmcv==2.0.1 -f https://download.openmmlab.com/mmcv/dist/cpu/torch1.13.0/index.html

# Add local tracklab to uv
~/.local/bin/uv add --editable ../../tracklab
```

### 4. Download Large Files

#### A. Pretrained Models

The pretrained models will be downloaded automatically on first run. However, you can pre-download them:

```bash
cd pretrained_models

# ReID model
mkdir -p reid
cd reid
wget https://github.com/VlSomers/bpbreid/releases/download/v1.0.0/prtreid-soccernet-baseline.pth.tar
cd ..

# YOLO model (downloads automatically on first run)
# Jersey number detection models (download automatically)
```

#### B. SoccerNet Dataset

The dataset will be downloaded automatically on first run. It requires:
- Train: ~10GB
- Valid: ~2-3GB
- Test: ~2-3GB
- Challenge: ~1-2GB

The dataset downloads to: `box18-ml/data/SoccerNetGS/`

**Note:** First run will take 30-60 minutes to download and extract all datasets.

### 5. Configure Data Path

Edit `sn_gamestate/configs/soccernet.yaml`:

```yaml
# Update this line with your absolute path
data_dir: /your/absolute/path/to/box18-ml/data
```

### 6. Apply Mac Compatibility Fixes

The original code was designed for CUDA GPUs. We've made the following modifications for Mac CPU execution:

#### Fix 1: Disable MPS (Metal Performance Shaders)

Edit `tracklab/tracklab/main.py` (line 86-91):

```python
# Comment out MPS detection
# if torch.backends.mps.is_available():
#     device = "mps"
if torch.cuda.is_available():
    device = "cuda"
else:
    device = "cpu"
```

Also edit the installed version in `.venv/lib/python3.9/site-packages/tracklab/main.py`

#### Fix 2: Update Dataset Task Name

Edit `tracklab/tracklab/wrappers/dataset/soccernet/soccernet_game_state.py` (around line 398-402):

```python
# Change "gamestate-2025" to "gamestate-2024"
mySoccerNetDownloader.downloadDataTask(task="gamestate-2024", split=splits)
with zipfile.ZipFile(dataset_path/"gamestate-2024"/f"{split}.zip", 'r') as zf:
```

Also edit the installed version in `.venv/lib/python3.9/site-packages/tracklab/wrappers/dataset/soccernet/soccernet_game_state.py`

#### Fix 3: Disable Multiprocessing

Edit `sn_gamestate/configs/soccernet.yaml` (line 49):

```yaml
# Set num_cores to 0 for Mac compatibility
num_cores: 0  # Multiprocessing not supported on MPS
```

#### Fix 4: Pin Transformers Version

Already done in `pyproject.toml`:

```toml
dependencies = [
    # ... other deps ...
    "transformers<4.30",  # For PyTorch 1.13 compatibility
]
```

## Running the Pipeline

### First Run (with dataset download)

```bash
cd sn-gamestate
source .venv/bin/activate
~/.local/bin/uv run tracklab -cn soccernet
```

**Expected time for first run:**
- Dataset download: 30-60 minutes
- Pipeline execution: 20-40 minutes (CPU is slow)
- Total: ~1-2 hours

### Subsequent Runs

```bash
cd sn-gamestate
source .venv/bin/activate
~/.local/bin/uv run tracklab -cn soccernet
```

**Expected time:** 20-40 minutes (CPU execution)

### Monitor Progress

```bash
# Check if process is running
ps aux | grep tracklab

# View latest logs
tail -f outputs/sn-gamestate/$(ls -t outputs/sn-gamestate/ | head -1)/main.log
```

## Output Files

Results are saved to:
```
sn-gamestate/outputs/sn-gamestate/YYYY-MM-DD/HH-MM-SS/
├── main.log                          # Execution log
├── states/sn-gamestate.pklz         # Tracker state (all detections, tracks, etc)
└── videos/                          # Visualization videos (if enabled)
```

## Configuration Options

Edit `sn_gamestate/configs/soccernet.yaml`:

```yaml
# Process only first N videos (set to -1 for all)
dataset:
  nvid: 1  # Process 1 video for testing

# Which split to process
dataset:
  eval_set: "valid"  # Options: "train", "valid", "test", "challenge"

# Enable/disable video output
visualization:
  cfg:
    save_videos: True  # Save .mp4 videos with annotations
```

## Troubleshooting

### "AttributeError: module 'torch' has no attribute 'compiler'"
- Solution: Transformers version too new. Ensure `transformers<4.30` is installed.

### "RuntimeError: _share_filename_: only available on CPU"
- Solution: Multiprocessing issue with MPS. Set `num_cores: 0` in config.

### "ERROR Unknown task: gamestate-2025"
- Solution: Update dataset task to `gamestate-2024` in tracklab files.

### Pipeline hangs during YOLO initialization
- Solution: MPS compatibility issue. Disable MPS in `main.py` as described above.

### Out of memory errors
- Solution: Reduce batch sizes in `soccernet.yaml`:
  ```yaml
  modules:
    bbox_detector: {batch_size: 4}  # Reduce from 8
    reid: {batch_size: 32}  # Reduce from 64
  ```

## Performance Notes

- **CPU execution is slow** (~20-40 minutes per video)
- For faster processing, use a machine with CUDA GPU
- MPS (Apple Silicon GPU) is not supported due to PyTorch 1.13 limitations
- Multiprocessing is disabled for Mac compatibility

## Next Steps for Box18

After successful pipeline execution:

1. **Inspect tracker state** to understand available data:
   ```python
   import pickle
   with open('outputs/.../states/sn-gamestate.pklz', 'rb') as f:
       tracker_state = pickle.load(f)
   ```

2. **Extract statistics** needed for Box18:
   - Minutes played (tracking duration per player)
   - Player positions and heatmaps
   - Sprint bursts (speed analysis)
   - Touches (ball proximity events)
   - Team formations

3. **Build aggregation scripts** to compute Box18 stats from tracker state

## References

- [SoccerNet Game State Challenge](https://github.com/SoccerNet/sn-gamestate)
- [TrackLab Documentation](https://github.com/TrackingLaboratory/tracklab)
- [SoccerNet Dataset](https://www.soccer-net.org/)
- [Box18 Project Specs](../../box18.md)
