# I compile a lot. I need to know the time stamp so I don't compile twice.
ts := `/bin/date "+%H:%M:%S"`
default:
	@echo Compiling to JavaScript at $(ts).
	@npx tsc
	@echo Done!