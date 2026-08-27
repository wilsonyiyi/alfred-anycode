#!/bin/bash

set -u

CACHE_DIRECTORY="${alfred_workflow_cache:-${TMPDIR:-/tmp}/alfred-anycode-cache}"
NODE_PATH_CACHE="${CACHE_DIRECTORY}/node-path"

find_node() {
  local candidate

  candidate="$(command -v node 2>/dev/null || true)"
  if [[ -n "${candidate}" && -x "${candidate}" ]]; then
    printf '%s\n' "${candidate}"
    return 0
  fi

  for candidate in /opt/homebrew/bin/node /usr/local/bin/node; do
    if [[ -x "${candidate}" ]]; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done

  local login_shell="${SHELL:-/bin/zsh}"
  local shell_output
  shell_output="$(
    DISABLE_AUTO_UPDATE=true ZSH_TMUX_AUTOSTARTED=true ZSH_TMUX_AUTOSTART=false \
      "${login_shell}" -ilc \
      'printf "__ANYCODE_NODE__%s\n" "$(command -v node 2>/dev/null)"' \
      2>/dev/null || true
  )"
  candidate="$(printf '%s\n' "${shell_output}" | sed -n 's/^__ANYCODE_NODE__//p' | tail -n 1)"

  if [[ -n "${candidate}" && -x "${candidate}" ]]; then
    printf '%s\n' "${candidate}"
    return 0
  fi

  return 1
}

node_path=""
if [[ -r "${NODE_PATH_CACHE}" ]]; then
  IFS= read -r node_path < "${NODE_PATH_CACHE}" || true
fi

if [[ -z "${node_path}" || ! -x "${node_path}" ]]; then
  node_path="$(find_node || true)"
  if [[ -n "${node_path}" ]]; then
    mkdir -p "${CACHE_DIRECTORY}"
    printf '%s\n' "${node_path}" > "${NODE_PATH_CACHE}"
  fi
fi

if [[ -n "${node_path}" && -x "${node_path}" ]]; then
  exec "${node_path}" "$@"
fi

printf '%s\n' '{"items":[{"title":"Could not find Node.js","subtitle":"Install Node.js 20 or later and restart Alfred.","valid":false}]}'
exit 1
