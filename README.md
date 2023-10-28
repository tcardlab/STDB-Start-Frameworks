# STDB-Start-Frameworks
SpacetimeDB getting started tutorial in various frontend frameworks.

<!-- 
  NOTE: 
    i wonder if it makes sense to use a local .spacetime/
    directory for developing. Sandboxed from other projects
    and easy to test from scratch (just delete & regen).
    I'll give it a shot just to try it and see how it goes.
-->

## Getting Started

### STDB Setup:

<details open>
<summary> Transient Setup </summary>
<!-- kinda hoped this would work...
  ```sh
  # Start DB Server (in this directory)
  spacetime start .spacetime -l="localhost:5000" --in-memory
  ```
  open new terminal 
  ```sh
  # Publish Module
  spacetime publish "stdb-start" -s="http://localhost:5000" --project-path server -a
  ```
-->

```sh
# Start DB Server (in this directory)
spacetime start .spacetime -l="localhost:5000" --in-memory
```
open new terminal 
```sh
# Register Server and Set Default (Global)
spacetime server add http://localhost:5000 "stdb-start-server" -d

# Publish Module
spacetime publish "stdb-start-db" -p="server"
```

May need to clean anon identity later
```sh
spacetime delete "stdb-start-db" -s="stdb-start-server" --force
spacetime server remove "stdb-start-server" --delete-identities
```
</details>

<details>
<summary> Robust Setup </summary>

```sh
# start Server
spacetime start .spacetime -l="localhost:5000" 
```

open new terminal 

```sh
# Register Server and Set Default (Global)
spacetime server add http://localhost:5000 "stdb-start-server" -d

# Fingerprint (Remove potentially obsolete identities)
# spacetime server fingerprint -I

# Create Identity on Server and Set Default
spacetime identity new -s="stdb-start-server" -n="stdb-start-owner" -d --no-email

# Publish Module
spacetime publish "stdb-start-db" --project-path server
```

</details>


### Run Frontend:
```sh
# install all (may take a bit)
npm i

# install just one framework
npm i --workspaces=false # init root deps
npm i -w=frameworks/vue # or your framework of choice

# run framework
npm start -w framework/xyz

# or
cd framework/xyz 
npm i 
npm start
```


## Deving
```sh
# Gen TS bindings
npm run gen:TS
```