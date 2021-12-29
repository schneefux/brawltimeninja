<?xml version="1.0"?>
<!--
  NOTE: User and query level settings are set up in "users.xml" file.
-->
<yandex>
    <path>{{ env "DATA_PATH" }}</path>
    <tmp_path>{{ env "TMP_PATH" }}</tmp_path>
    <max_server_memory_usage>{{ env "NOMAD_MEMORY_LIMIT" | parseInt | multiply 1000000 }}</max_server_memory_usage>

    <logger>
        <!-- Possible levels: https://github.com/pocoproject/poco/blob/develop/Foundation/include/Poco/Logger.h#L105 -->
        <level>information</level>
        <size>1000M</size>
        <count>10</count>
        <console>1</console> <!-- Default behavior is autodetection (log to console if not daemon mode and is tty) -->
    </logger>
    <!--display_name>production</display_name--> <!-- It is the name that will be shown in the client -->
    <http_port>{{ env "NOMAD_PORT_http" }}</http_port>
    <tcp_port>{{ env "NOMAD_PORT_tcp" }}</tcp_port>

    <!-- Port for communication between replicas. Used for data exchange. -->
    <interserver_http_port>{{ env "NOMAD_PORT_interserver" }}</interserver_http_port>

    <!-- Hostname that is used by other replicas to request this server.
         If not specified, than it is determined analoguous to 'hostname -f' command.
         This setting could be used to switch replication to another network interface.
      -->
    <!--
    <interserver_http_host>example.yandex.ru</interserver_http_host>
    -->

    <listen_host>0.0.0.0</listen_host>

    <!-- Default values - try listen localhost on ipv4 and ipv6: -->
    <!--
    <listen_host>::1</listen_host>
    <listen_host>127.0.0.1</listen_host>
    -->
    <!-- Don't exit if ipv6 or ipv4 unavailable, but listen_host with this protocol specified -->
    <!-- <listen_try>0</listen_try> -->

    <!-- Allow listen on same address:port -->
    <!-- <listen_reuse_port>0</listen_reuse_port> -->

    <!-- <listen_backlog>64</listen_backlog> -->

    <max_connections>4096</max_connections>
    <keep_alive_timeout>3</keep_alive_timeout>

    <!-- Maximum number of concurrent queries. -->
    <max_concurrent_queries>100</max_concurrent_queries>

    <!-- Size of cache of uncompressed blocks of data, used in tables of MergeTree family.
         In bytes. Cache is single for server. Memory is allocated only on demand.
         Cache is used when 'use_uncompressed_cache' user setting turned on (off by default).
         Uncompressed cache is advantageous only for very short queries and in rare cases.
      -->
    <uncompressed_cache_size>8589934592</uncompressed_cache_size>

    <!-- Approximate size of mark cache, used in tables of MergeTree family.
         In bytes. Cache is single for server. Memory is allocated only on demand.
         You should not lower this value.
      -->
    <mark_cache_size>5368709120</mark_cache_size>

    <!-- Default profile of settings. -->
    <default_profile>default</default_profile>

    <!-- Default database. -->
    <default_database>default</default_database>

    <!-- <timezone>Europe/Moscow</timezone> -->

    <query_log remove="remove" />
<!--
    <query_log>
     	<database>system</database>
      <table>query_log</table>
      <partition_by>toYYYYMM(event_date)</partition_by>
      <ttl>event_date + INTERVAL 30 DAY DELETE</ttl>
      <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    </query_log>
-->

    <!-- Trace log. Stores stack traces collected by query profilers.
         See query_profiler_real_time_period_ns and query_profiler_cpu_time_period_ns settings. -->
    <trace_log>
        <database>system</database>
        <table>trace_log</table>

        <partition_by>toYYYYMM(event_date)</partition_by>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    </trace_log>

    <!-- Query thread log. Has information about all threads participated in query execution.
         Used only for queries with setting log_query_threads = 1. -->
    <query_thread_log remove="remove" />
    <!--
    <query_thread_log>
        <database>system</database>
        <table>query_thread_log</table>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    </query_thread_log>
    -->

    <!-- Uncomment if use part log.
         Part log contains information about all actions with parts in MergeTree tables (creation, deletion, merges, downloads).
    <part_log>
        <database>system</database>
        <table>part_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    </part_log>
    -->


    <!-- Parameters for embedded dictionaries, used in Yandex.Metrica.
         See https://clickhouse.yandex/docs/en/dicts/internal_dicts/
    -->

    <!-- Path to file with region hierarchy. -->
    <!-- <path_to_regions_hierarchy_file>/opt/geo/regions_hierarchy.txt</path_to_regions_hierarchy_file> -->

    <!-- Path to directory with files containing names of regions -->
    <!-- <path_to_regions_names_files>/opt/geo/</path_to_regions_names_files> -->


    <!-- Configuration of external dictionaries. See:
         https://clickhouse.yandex/docs/en/dicts/external_dicts/
    -->
    <dictionaries_config>*_dictionary.xml</dictionaries_config>

    <!-- Uncomment if you want data to be compressed 30-100% better.
         Don't do that if you just started using ClickHouse.
      -->
    <compression incl="clickhouse_compression">
    <!--
        <!- - Set of variants. Checked in order. Last matching case wins. If nothing matches, lz4 will be used. - ->
        <case>

            <!- - Conditions. All must be satisfied. Some conditions may be omitted. - ->
            <min_part_size>10000000000</min_part_size>        <!- - Min part size in bytes. - ->
            <min_part_size_ratio>0.01</min_part_size_ratio>   <!- - Min size of part relative to whole table size. - ->

            <!- - What compression method to use. - ->
            <method>zstd</method>
        </case>
    -->
    </compression>

    <!-- Protection from accidental DROP.
         If size of a MergeTree table is greater than max_table_size_to_drop (in bytes) than table could not be dropped with any DROP query.
         If you want do delete one table and don't want to restart clickhouse-server, you could create special file <clickhouse-path>/flags/force_drop_table and make DROP once.
         By default max_table_size_to_drop is 50GB; max_table_size_to_drop=0 allows to DROP any tables.
         The same for max_partition_size_to_drop.
         Uncomment to disable protection.
    -->
    <!-- <max_table_size_to_drop>0</max_table_size_to_drop> -->
    <!-- <max_partition_size_to_drop>0</max_partition_size_to_drop> -->
</yandex>
