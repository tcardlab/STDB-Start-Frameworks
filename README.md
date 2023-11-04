# STDB-Start-Frameworks
SpacetimeDB getting started tutorial in various frontend frameworks.

> Only Vue, Solid, and Mitosis(vue, react, svelte) are set up atm, will chip away at the others over time.

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
<summary> <h4>Setup</h4> </summary>

<!--
  My goal for this set up is not to merely be as simple as possible (ie scripting it away). Rather, its to introduce
  people to the general aspects of managing a server and identity in STDB (primarily creation and cleanup). 
-->

```sh
# Start Server (with local `.spacetime` DB directory)
spacetime start .spacetime -l="localhost:5000" 
```

open new terminal 

```sh
# Register Server and Set Default (Global)
spacetime server add http://localhost:5000 "stdb-start-server" -d
# If already added: spacetime server set-default "stdb-start-server"

# Create Identity on Server and Set Default
spacetime identity new -s="stdb-start-server" -n="stdb-start-owner" -d --no-email
# If already added: spacetime identity set-default "stdb-start-owner"

# Publish Module
spacetime publish "stdb-start-db" --project-path server
```
</details>

<br/>

<details>
<summary> <h4>How To Cleanup Later</h4> </summary>

```sh
# Because .spacetime was generated locally, 
# you could just delete that directory without side effects (a nuclear solution). 
# Here is the precision-method:
spacetime delete "stdb-start-db" -s="stdb-start-server" -i="stdb-start-owner" --force
spacetime identity remove "stdb-start-owner"
```
</details>


### Run Frontend:
```sh
# install all (may take a bit)
npm i

# install just one framework
npm i --workspaces=false # init root deps
npm i -w=frameworks/vue # framework of choice

# run framework
npm start -w framework/xyz
# mitosis:
#   npm start <framework: vue|svelte|react> -w=frameworks/mitosis
#   npm start vue -w=frameworks/mitosis

# or
cd framework/xyz 
npm i 
npm start
```

**Common Errors:**
If you keep being re-assigned a new identity, you probably have an invalid ID in localStorage (prob from an old project or database/server). Just delete that value and it should work as expected. (I'll add an error handler to do this automatically eventually)  


## Deving
```sh
# Gen TS bindings
npm run gen:TS
```
